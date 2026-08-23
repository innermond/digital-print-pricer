import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductConfigurator from './ProductConfigurator';

const ENDPOINT = '/api/price';

// Real timers throughout: the 400ms debounce is cheap to wait out, and fake
// timers deadlock against userEvent's internal awaits.
const setupUser = () => userEvent.setup({ delay: null });

const priceOk = (price = 12.5) =>
  vi.fn().mockResolvedValue({ ok: true, json: async () => ({ price, currency: 'RON' }) });

const renderConfigurator = (props: Record<string, unknown> = {}) =>
  render(<ProductConfigurator priceEndpoint={ENDPOINT} {...props} />);

const fetchMock = () => vi.mocked(fetch);
const bodyOf = (callIndex: number) =>
  JSON.parse(fetchMock().mock.calls[callIndex][1]!.body as string);

// The flow gates every stage past the first behind a selected product, so most
// tests start by picking the default flyer (prod1a) from its category.
async function selectFlyer(user: ReturnType<typeof setupUser>) {
  await user.click(screen.getByText('Fluturaș'));
  await user.click(screen.getByText('Fluturaș A4 Color, Față-Verso'));
}

describe('ProductConfigurator', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', priceOk());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('flow', () => {
    it('opens on the product stage with later stages locked', () => {
      renderConfigurator();

      expect(screen.getByRole('navigation', { name: 'Etape' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Pasul 1 din 3: Produs/ })).toHaveAttribute(
        'aria-current',
        'step'
      );
      expect(screen.getByText('Selectați Categoria')).toBeInTheDocument();
      // Nothing past the product stage is reachable yet.
      expect(screen.getByRole('button', { name: /Pasul 2 din 3: Configurare/ })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Continuă la Configurare/ })).toBeDisabled();
    });

    it('drills into a category and back out', async () => {
      const user = setupUser();
      renderConfigurator();

      await user.click(screen.getByText('Fluturaș'));
      expect(screen.getByText('Fluturaș A4 Color, Față-Verso')).toBeInTheDocument();
      expect(screen.queryByText('Selectați Categoria')).not.toBeInTheDocument();

      await user.click(screen.getByText('← Înapoi la categorii'));
      expect(screen.getByText('Selectați Categoria')).toBeInTheDocument();
    });

    it('double-clicking a product selects it and jumps straight to Configurare', async () => {
      const user = setupUser();
      renderConfigurator();

      await user.click(screen.getByText('Fluturaș'));
      await user.dblClick(screen.getByText('Fluturaș A4 Color, Față-Verso'));

      expect(screen.getByText('Material')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Pasul 2 din 3: Configurare/ })).toHaveAttribute(
        'aria-current',
        'step'
      );
    });

    it('moves forward and back through the three stages', async () => {
      const user = setupUser();
      renderConfigurator();
      await selectFlyer(user);

      await user.click(screen.getByRole('button', { name: /Continuă la Configurare/ }));
      expect(screen.getByText('Material')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Continuă la Ofertă/ }));
      expect(screen.getByText('Previzualizare')).toBeInTheDocument();
      // The last stage has no forward action.
      expect(screen.queryByRole('button', { name: /Continuă la/ })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /^Înapoi$/ }));
      expect(screen.getByText('Material')).toBeInTheDocument();
    });

    it('jumps to a stage from the progress nav', async () => {
      const user = setupUser();
      renderConfigurator();
      await selectFlyer(user);

      await user.click(screen.getByRole('button', { name: /Pasul 3 din 3: Ofertă/ }));
      expect(screen.getByText('Previzualizare')).toBeInTheDocument();
      expect(screen.getAllByText(/Coală Simplă/).length).toBeGreaterThan(0);
    });

    it('hides Export/Import by default but keeps Resetare', () => {
      renderConfigurator();
      expect(screen.queryByRole('button', { name: /Export/ })).not.toBeInTheDocument();
      expect(screen.queryByText('Import')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Resetare/ })).toBeInTheDocument();
    });

    it('shows the admin tools in the header when explicitly enabled', () => {
      renderConfigurator({ showExportImport: true });
      expect(screen.getByRole('button', { name: /Export/ })).toBeInTheDocument();
      expect(screen.getByText('Import')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Resetare/ })).toBeInTheDocument();
    });

    it('opens on the configuration stage when the host preselects a product', () => {
      renderConfigurator({ initialProductId: 'prod1a' });

      expect(screen.getByRole('button', { name: /Pasul 2 din 3: Configurare/ })).toHaveAttribute(
        'aria-current',
        'step'
      );
      expect(screen.getByText('Material')).toBeInTheDocument();
      // A host-locked category has no escape hatch back to the category list.
      expect(screen.queryByText('← Înapoi la categorii')).not.toBeInTheDocument();
    });
  });

  describe('auto-pricing', () => {
    it('prices the selection as soon as a product is picked', async () => {
      const user = setupUser();
      renderConfigurator();
      await selectFlyer(user);

      // Unit price plus the total for the seeded quantity (prod1a is seeded at 50)
      expect(await screen.findByText('RON 12.50')).toBeInTheDocument();
      expect(screen.getByText('RON 625.00')).toBeInTheDocument();

      expect(fetchMock()).toHaveBeenCalledTimes(1);
      expect(bodyOf(0).productId).toBe('prod1a');
      expect(bodyOf(0).elementals).toHaveLength(1);
    });

    it('marks the panel busy the moment the configuration changes, then re-prices', async () => {
      const user = setupUser();
      renderConfigurator();
      await selectFlyer(user);
      await screen.findByText('RON 12.50');

      await user.click(screen.getByRole('button', { name: /Continuă la Configurare/ }));
      await user.click(screen.getByText('A5'));

      // Busy before the debounce elapses: the old number is never presented as
      // current, not even for a frame.
      expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();

      await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
      expect(bodyOf(1).elementals[0].size.width).toBe(148);
    });

    it('collapses a burst of changes into a single request', async () => {
      const user = setupUser();
      renderConfigurator();
      await selectFlyer(user);
      await screen.findByText('RON 12.50');
      await user.click(screen.getByRole('button', { name: /Continuă la Configurare/ }));
      fetchMock().mockClear();

      // Three size changes well inside the debounce window.
      await user.click(screen.getByText('A5'));
      await user.click(screen.getByText('A4'));
      await user.click(screen.getByText('A5'));

      await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
      expect(bodyOf(0).elementals[0].size.width).toBe(148);
    });

    it('serves a repeated configuration from cache without refetching', async () => {
      const user = setupUser();
      renderConfigurator();
      await selectFlyer(user);
      await screen.findByText('RON 12.50');
      await user.click(screen.getByRole('button', { name: /Continuă la Configurare/ }));

      await user.click(screen.getByText('A5'));
      await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));

      // Back to the original spec — already priced, so no third request.
      await user.click(screen.getByText('A4'));
      await waitFor(() => expect(screen.getByText('RON 12.50')).toBeInTheDocument());
      expect(fetchMock()).toHaveBeenCalledTimes(2);
    });

    it('shows an error with a retry when the request fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
      const user = setupUser();
      renderConfigurator();
      await selectFlyer(user);

      expect(await screen.findByText('Eroare API: 500')).toBeInTheDocument();
      // No figure at all while errored — a wrong price is worse than none.
      expect(screen.queryByText(/^RON /)).not.toBeInTheDocument();

      vi.stubGlobal('fetch', priceOk(9));
      await user.click(screen.getByRole('button', { name: /Reîncearcă/ }));
      expect(await screen.findByText('RON 9.00')).toBeInTheDocument();
    });

    it('never fetches without a configured endpoint', async () => {
      const user = setupUser();
      render(<ProductConfigurator />);
      await selectFlyer(user);

      expect(await screen.findByText(/endpoint neconfigurat/)).toBeInTheDocument();
      expect(fetchMock()).not.toHaveBeenCalled();
    });
  });

  describe('offer handoff', () => {
    it('emits pricer:offer with the price for the current configuration', async () => {
      const user = setupUser();
      const onOffer = vi.fn();
      document.addEventListener('pricer:offer', onOffer);

      renderConfigurator();
      await selectFlyer(user);
      await screen.findByText('RON 12.50');
      await user.click(screen.getByRole('button', { name: /Pasul 3 din 3: Ofertă/ }));
      await user.click(screen.getByRole('button', { name: /Cere ofertă pe email/ }));

      expect(onOffer).toHaveBeenCalledTimes(1);
      const detail = onOffer.mock.calls[0][0].detail;
      expect(detail.price).toBe(12.5);
      expect(detail.currency).toBe('RON');
      expect(detail.selection.productId).toBe('prod1a');

      document.removeEventListener('pricer:offer', onOffer);
    });

    it('disables the offer button while the price is stale', async () => {
      const user = setupUser();
      renderConfigurator();
      await selectFlyer(user);
      await screen.findByText('RON 12.50');
      await user.click(screen.getByRole('button', { name: /Pasul 3 din 3: Ofertă/ }));

      const offerButton = screen.getByRole('button', { name: /Cere ofertă pe email/ });
      expect(offerButton).toBeEnabled();

      // Changing the quantity invalidates the quote until the new one lands, so
      // a superseded price can never be sent to the host.
      await user.click(screen.getByRole('button', { name: 'Crește' }));
      expect(offerButton).toBeDisabled();

      await waitFor(() => expect(offerButton).toBeEnabled());
    });
  });

  describe('quantity', () => {
    it('persists an incremented amount to localStorage', async () => {
      const user = setupUser();
      renderConfigurator();
      await selectFlyer(user);

      await user.click(screen.getByRole('button', { name: 'Crește' }));

      const saved = JSON.parse(localStorage.getItem('products')!);
      const flyer = saved.find((p: { id: string }) => p.id === 'prod1a');
      expect(flyer.amount).toBe(51); // seeded at 50
    });

    it('ignores an emptied quantity field instead of going NaN', async () => {
      const user = setupUser();
      renderConfigurator();
      await selectFlyer(user);

      const textbox = screen.getByLabelText('Cantitate') as HTMLInputElement;
      const before = textbox.value; // last valid value
      await user.clear(textbox);    // empty input is ignored, not written as NaN

      expect(textbox).toHaveValue(before);
      expect(textbox.value).not.toBe('NaN');
      const saved = JSON.parse(localStorage.getItem('products')!);
      expect(Number.isNaN(saved[0].amount)).toBe(false);
    });
  });

  it('shares one size across elements of a multi-element product', async () => {
    const user = setupUser();
    renderConfigurator();

    // Brochure prod2a has Copertă + Interior, both seeded A4; allowed sizes A4/A5.
    await user.click(screen.getByText('Broșură'));
    await user.click(screen.getByText('Broșură A4, Interior 8 Pagini'));
    await user.click(screen.getByRole('button', { name: /Continuă la Configurare/ }));

    // Change the size on the (cover) tab to A5 — it must propagate to both.
    await user.click(screen.getByText('A5'));

    const saved = JSON.parse(localStorage.getItem('products')!);
    const brochure = saved.find((p: { id: string }) => p.id === 'prod2a');
    expect(brochure.elementals).toHaveLength(2);
    for (const el of brochure.elementals) {
      expect(el.size.widthMm).toBe(148);
      expect(el.size.heightMm).toBe(210);
    }
  });
});
