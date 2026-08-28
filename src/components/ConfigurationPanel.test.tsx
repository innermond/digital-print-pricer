import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigurationPanel } from './ConfigurationPanel';
import { MOCK_MEDIA, MOCK_SIZES } from '../data/mockData';
import { makeConfig, makeElemental, makeFinishing, makePaper, makeMachine, makeSize } from '../test/fixtures';

// The panel filters the media/sizes it's given by the config, so use real ids:
// p2 = "120 GSM - Lucios", p3 = "150 GSM - Mat", s1 = A4, s2 = A5.
const element = makeElemental({ media: makePaper({ id: 'p2', label: '120 GSM - Lucios', gsm: 120 }) });
const config = makeConfig();

function renderPanel(overrides: Partial<Parameters<typeof ConfigurationPanel>[0]> = {}) {
  const props = {
    element,
    onUpdate: vi.fn(),
    customSizeUnit: 'mm' as const,
    onCustomSizeUnitChange: vi.fn(),
    config,
    media: MOCK_MEDIA,
    sizes: MOCK_SIZES,
    machines: [makeMachine()],
    ...overrides,
  };
  render(<ConfigurationPanel {...props} />);
  return props;
}

describe('ConfigurationPanel', () => {
  it('renders the media allowed by the config', () => {
    renderPanel();
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('120 GSM - Lucios')).toBeInTheDocument();
    expect(screen.getByText('150 GSM - Mat')).toBeInTheDocument();
    expect(screen.queryByText('90 GSM - Silk')).not.toBeInTheDocument();
  });

  it('renders the sizes allowed by the config', () => {
    renderPanel();
    expect(screen.getByText('Dimensiune')).toBeInTheDocument();
    expect(screen.getByText('A4')).toBeInTheDocument();
    expect(screen.getByText('A5')).toBeInTheDocument();
    expect(screen.queryByText('A3')).not.toBeInTheDocument();
  });

  it('excludes preset sizes larger than the resolved machine max, with a note why', () => {
    // A4 is 210x297mm; its short edge alone is past this press's 200mm one, so
    // no orientation saves it. A5 (148x210mm) still fits.
    renderPanel({
      config: makeConfig({ allowedSizeIds: ['s1', 's2'], machineId: 'm1' }),
      machines: [makeMachine({ id: 'm1', maxWidthMm: 200, maxHeightMm: 450 })],
    });
    expect(screen.getByText('A5')).toBeInTheDocument();
    expect(screen.queryByText('A4')).not.toBeInTheDocument();
    expect(screen.getByText(/depășesc limita presei/)).toBeInTheDocument();
  });

  it('shows no hidden-by-machine note when the config resolves no machine', () => {
    renderPanel();
    expect(screen.queryByText(/depășesc limita presei/)).not.toBeInTheDocument();
  });

  it('renders printing as an essential and finishing behind the disclosure', async () => {
    const user = userEvent.setup();
    // The shared element is 120 GSM, which rules out every media-driven finishing,
    // so allow a fold to keep the Finisare section populated.
    renderPanel({ config: makeConfig({ allowedFoldTypes: ['none', 'half-fold'] }) });

    expect(screen.getByText('Tipărire')).toBeInTheDocument();
    // Finishing is advanced: hidden until the section is opened.
    expect(screen.queryByText('Finisare')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Opțiuni avansate/ }));
    expect(screen.getByText('Finisare')).toBeInTheDocument();
  });

  it('keeps the exact-dimensions control out of the essentials', async () => {
    const user = userEvent.setup();
    renderPanel();

    expect(screen.queryByLabelText(/Lățime/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Opțiuni avansate/ }));
    expect(screen.getByLabelText('Lățime (mm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Înălțime (mm)')).toBeInTheDocument();
  });

  it('caps a dimension by what the press can take beside the other one', async () => {
    const user = userEvent.setup();
    // The press is 320×450 and the sheet is an A4 lying down (297×210). With a
    // height of 210 the width may run to the press's long edge, so 450 — not
    // the 320 a width-against-width reading would give.
    renderPanel({
      element: makeElemental({ size: makeSize({ width: 297, height: 210, widthMm: 297, heightMm: 210 }) }),
      config: makeConfig({ machineId: 'm1' }),
      machines: [makeMachine({ id: 'm1', maxWidthMm: 320, maxHeightMm: 450 })],
    });

    await user.click(screen.getByRole('button', { name: /Opțiuni avansate/ }));
    expect(screen.getByLabelText('Lățime (mm) · max 450')).toBeInTheDocument();
    // The height sits beside a 297mm width, which is the press's short edge or
    // less, so it too may run long.
    expect(screen.getByLabelText('Înălțime (mm) · max 450')).toBeInTheDocument();
  });

  it('drops the cap to the press short edge once the other side is long', async () => {
    const user = userEvent.setup();
    renderPanel({
      element: makeElemental({ size: makeSize({ width: 200, height: 400, widthMm: 200, heightMm: 400 }) }),
      config: makeConfig({ machineId: 'm1' }),
      machines: [makeMachine({ id: 'm1', maxWidthMm: 320, maxHeightMm: 450 })],
    });

    await user.click(screen.getByRole('button', { name: /Opțiuni avansate/ }));
    expect(screen.getByLabelText('Lățime (mm) · max 320')).toBeInTheDocument();
  });

  it('reports a media selection', async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderPanel();

    await user.click(screen.getByText('150 GSM - Mat'));
    expect(onUpdate).toHaveBeenCalledWith({
      media: expect.objectContaining({ id: 'p3' }),
    });
  });

  it('hides the page count control by default', () => {
    renderPanel();
    expect(screen.queryByText('Pagini')).not.toBeInTheDocument();
  });

  it('shows the page count control for a "multiple" constraint', () => {
    renderPanel({
      config: makeConfig({
        elementalPageCounts: { [element.id]: { kind: 'multiple', of: 4, min: 8, max: 64 } },
      }),
    });
    expect(screen.getByText('Pagini')).toBeInTheDocument();
    expect(screen.getByText('multipli de 4, 8–64')).toBeInTheDocument();
  });

  it('keeps the page count control hidden for a "derived" constraint', () => {
    renderPanel({
      config: makeConfig({
        elementalPageCounts: { [element.id]: { kind: 'derived' } },
      }),
    });
    expect(screen.queryByText('Pagini')).not.toBeInTheDocument();
  });

  it('falls back to the product-wide page count rule', () => {
    // An element the user added at runtime has an id no catalog could key on,
    // so elementalPageCounts can never cover it.
    renderPanel({
      config: makeConfig({
        allowedPageCount: { kind: 'multiple', of: 1, min: 1, max: 500 },
      }),
    });
    expect(screen.getByText('Pagini')).toBeInTheDocument();
    expect(screen.getByText('multipli de 1, 1–500')).toBeInTheDocument();
  });

  it('lets a per-elemental rule override the product-wide one', () => {
    renderPanel({
      config: makeConfig({
        allowedPageCount: { kind: 'multiple', of: 1, min: 1, max: 500 },
        elementalPageCounts: { [element.id]: { kind: 'derived' } },
      }),
    });
    expect(screen.queryByText('Pagini')).not.toBeInTheDocument();
  });

  it('applies per-elemental printing restrictions', () => {
    renderPanel({
      config: makeConfig({
        elementalPrintingFronts: { [element.id]: ['color'] },
        elementalPrintingBacks: { [element.id]: [] },
      }),
    });
    expect(screen.getByRole('button', { name: 'Color' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Alb-negru' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Verso' })).not.toBeInTheDocument();
  });
});

describe('ConfigurationPanel — folded products are printed flat', () => {
  const press = [makeMachine({ id: 'm1', maxWidthMm: 320, maxHeightMm: 450 })];
  const foldedConfig = makeConfig({
    machineId: 'm1',
    allowedSizeIds: ['s1', 's2', 's4'],
    allowedFoldTypes: ['half-fold', 'tri-fold', 'z-fold', 'gate-fold'],
  });
  const foldedElement = (type: 'half-fold' | 'tri-fold') =>
    makeElemental({
      media: makePaper({ id: 'p2', label: '120 GSM - Lucios', gsm: 120 }),
      finishing: makeFinishing({ folding: { type, folds: type === 'tri-fold' ? 2 : 1 } }),
    });

  it('hides a size that only fits while it stays folded', () => {
    // A4 tri-folded is a 630×297 sheet; A5 (444×210) and 1/3A4 (300×210) still go.
    renderPanel({ element: foldedElement('tri-fold'), config: foldedConfig, machines: press });
    expect(screen.queryByText('A4')).not.toBeInTheDocument();
    expect(screen.getByText('A5')).toBeInTheDocument();
    expect(screen.getByText('1/3A4')).toBeInTheDocument();
    expect(screen.getByText(/depășesc limita presei/)).toBeInTheDocument();
  });

  it('keeps that same size when the fold opens out to less', () => {
    // Half-folded, the same A4 is a 420×297 sheet, which the press does take.
    renderPanel({ element: foldedElement('half-fold'), config: foldedConfig, machines: press });
    expect(screen.getByText('A4')).toBeInTheDocument();
  });

  it('caps the exact dimensions against the sheet, not the finished piece', async () => {
    const user = userEvent.setup();
    renderPanel({ element: foldedElement('tri-fold'), config: foldedConfig, machines: press });

    await user.click(screen.getByRole('button', { name: /Opțiuni avansate/ }));
    // Beside a height of 297: 150 wide tri-folds out to exactly 450×297.
    expect(screen.getByLabelText('Lățime (mm) · max 150')).toBeInTheDocument();
    // Also 150, but for the other reason: past that the height is the long edge,
    // so the 210mm width is what triples, and 630 will not go at any height.
    expect(screen.getByLabelText('Înălțime (mm) · max 150')).toBeInTheDocument();
  });

  it('measures a Mapă by the sheet its cover is half of', async () => {
    const user = userEvent.setup();
    // The folder is creased rather than folded, so its factor comes from the config.
    renderPanel({
      element: makeElemental({ media: makePaper({ id: 'p2', gsm: 120 }) }),
      config: makeConfig({ machineId: 'm1', foldedInHalf: true }),
      machines: press,
    });

    await user.click(screen.getByRole('button', { name: /Opțiuni avansate/ }));
    expect(screen.getByLabelText('Lățime (mm) · max 225')).toBeInTheDocument();
  });

  it('turns off a fold the current size cannot be opened out of', async () => {
    const user = userEvent.setup();
    renderPanel({ element: foldedElement('half-fold'), config: foldedConfig, machines: press });

    await user.click(screen.getByRole('button', { name: /Opțiuni avansate/ }));
    expect(screen.getByRole('button', { name: 'Pliere la jumătate' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Pliere poartă' })).toBeEnabled();
    // A4 tri-folded is 630×297 — past the press, so it is not on offer.
    expect(screen.getByRole('button', { name: 'Pliere în trei' })).toBeDisabled();
  });
});
