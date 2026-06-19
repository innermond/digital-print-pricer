import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductConfigurator from './ProductConfigurator';

describe('ProductConfigurator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts on the category step in wizard mode', () => {
    render(<ProductConfigurator />);
    expect(screen.getByText('Configurator de Produse')).toBeInTheDocument();
    expect(screen.getByText('Selectați Categoria')).toBeInTheDocument();
    expect(screen.getByText('Fluturaș')).toBeInTheDocument();
    // Later steps are hidden in wizard mode
    expect(screen.queryByText('Previzualizare')).not.toBeInTheDocument();
  });

  it('drills into a category and back out', async () => {
    const user = userEvent.setup();
    render(<ProductConfigurator />);

    await user.click(screen.getByText('Fluturaș'));
    expect(screen.getByText('Fluturaș A4 Color, Față-Verso')).toBeInTheDocument();
    expect(screen.queryByText('Selectați Categoria')).not.toBeInTheDocument();

    await user.click(screen.getByText('← Înapoi la categorii'));
    expect(screen.getByText('Selectați Categoria')).toBeInTheDocument();
  });

  it('navigates between steps with the next/previous buttons', async () => {
    const user = userEvent.setup();
    render(<ProductConfigurator />);

    const [nextButton] = screen.getAllByRole('button', { name: /Înainte/ });
    const [prevButton] = screen.getAllByRole('button', { name: /Înapoi$/ });
    expect(prevButton).toBeDisabled();

    await user.click(nextButton);
    expect(screen.getByRole('heading', { name: 'Cantitate Produs' })).toBeInTheDocument();
    expect(screen.queryByText('Selectați Categoria')).not.toBeInTheDocument();
    expect(prevButton).toBeEnabled();

    await user.click(prevButton);
    expect(screen.getByText('Selectați Categoria')).toBeInTheDocument();
  });

  it('jumps to a step from the step list', async () => {
    const user = userEvent.setup();
    render(<ProductConfigurator />);

    await user.click(screen.getByRole('button', { name: '4. Previzualizare & Sumar' }));
    expect(screen.getByText('Previzualizare')).toBeInTheDocument();
    // First product's elemental, shown in both preview and summary
    expect(screen.getAllByText(/Coală Simplă/).length).toBeGreaterThan(0);
  });

  it('shows everything at once when wizard mode is off', async () => {
    const user = userEvent.setup();
    render(<ProductConfigurator />);

    await user.click(screen.getByRole('checkbox', { name: 'Mod pas-cu-pas' }));
    expect(screen.getByText('Selectați Categoria')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cantitate Produs' })).toBeInTheDocument();
    expect(screen.getByText('Previzualizare')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Preț' })).toBeInTheDocument();
  });

  it('shows the configuration tabs for the selected product', async () => {
    const user = userEvent.setup();
    render(<ProductConfigurator />);

    await user.click(screen.getByRole('button', { name: '3. Configurare' }));
    expect(screen.getByRole('button', { name: 'Coală Simplă' })).toBeInTheDocument();
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Dimensiune')).toBeInTheDocument();
  });

  it('fetches and displays the price', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ price: 12.5, currency: 'RON' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ProductConfigurator />);
    await user.click(screen.getByRole('button', { name: '5. Preț' }));
    await user.click(screen.getByRole('button', { name: /Obține Preț/ }));

    // Shown twice: unit price and total (amount is 1)
    expect(await screen.findAllByText('RON 12.50')).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.productId).toBe('prod1a');
    expect(body.elementals).toHaveLength(1);
  });

  it('shows an error when the price request fails', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    render(<ProductConfigurator />);
    await user.click(screen.getByRole('button', { name: '5. Preț' }));
    await user.click(screen.getByRole('button', { name: /Obține Preț/ }));

    expect(await screen.findByText('Eroare API: 500')).toBeInTheDocument();
  });

  it('persists products to localStorage', async () => {
    const user = userEvent.setup();
    render(<ProductConfigurator />);

    // Bump the amount of the default product on the quantity step
    const [nextButton] = screen.getAllByRole('button', { name: /Înainte/ });
    await user.click(nextButton);
    // The quantity step shows a single NumericButton; its input's container
    // holds the plus/minus buttons (plus first).
    const amountGroup = screen.getByRole('textbox').parentElement!;
    const [plusButton] = within(amountGroup).getAllByRole('button');
    await user.click(plusButton);

    const saved = JSON.parse(localStorage.getItem('products')!);
    expect(saved[0].amount).toBe(2);
  });

  it('ignores an emptied quantity field instead of going NaN', async () => {
    const user = userEvent.setup();
    localStorage.clear();
    render(<ProductConfigurator />);

    const [nextButton] = screen.getAllByRole('button', { name: /Înainte/ });
    await user.click(nextButton);

    const textbox = screen.getByRole('textbox') as HTMLInputElement;
    const before = textbox.value; // last valid value
    await user.clear(textbox);    // empty input is ignored, not written as NaN

    expect(textbox).toHaveValue(before);
    expect(textbox.value).not.toBe('NaN');
    const saved = JSON.parse(localStorage.getItem('products')!);
    expect(Number.isNaN(saved[0].amount)).toBe(false);
  });

  it('shares one size across elements of a multi-element product', async () => {
    const user = userEvent.setup();
    localStorage.clear();
    render(<ProductConfigurator />);

    // Brochure prod2a has Copertă + Interior, both seeded A4; allowed sizes A4/A5.
    await user.click(screen.getByText('Broșură'));
    await user.click(screen.getByText('Broșură A4, Interior 8 Pagini'));
    await user.click(screen.getByRole('button', { name: '3. Configurare' }));

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
