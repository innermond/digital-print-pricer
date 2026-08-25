import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigurationPanel } from './ConfigurationPanel';
import { MOCK_MEDIA, MOCK_SIZES } from '../data/mockData';
import { makeConfig, makeElemental, makePaper, makeMachine } from '../test/fixtures';

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
    // A4 is 210x297mm; a 200mm-wide machine rules it out but not A5 (148x210mm).
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
