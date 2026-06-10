import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigurationPanel } from './ConfigurationPanel';
import { makeConfig, makeElemental, makePaper } from '../test/fixtures';

// The panel reads MOCK_MEDIA/MOCK_SIZES, so the config must use real ids:
// p2 = "130 GSM - Lucios", p3 = "170 GSM - Mat", s1 = A4, s2 = A5.
const element = makeElemental({ media: makePaper({ id: 'p2', label: '130 GSM - Lucios', gsm: 130 }) });
const config = makeConfig();

function renderPanel(overrides: Partial<Parameters<typeof ConfigurationPanel>[0]> = {}) {
  const props = {
    element,
    onUpdate: vi.fn(),
    customSizeUnit: 'mm' as const,
    onCustomSizeUnitChange: vi.fn(),
    config,
    ...overrides,
  };
  render(<ConfigurationPanel {...props} />);
  return props;
}

describe('ConfigurationPanel', () => {
  it('renders the media allowed by the config', () => {
    renderPanel();
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('130 GSM - Lucios')).toBeInTheDocument();
    expect(screen.getByText('170 GSM - Mat')).toBeInTheDocument();
    expect(screen.queryByText('80 GSM - Silk')).not.toBeInTheDocument();
  });

  it('renders the sizes allowed by the config', () => {
    renderPanel();
    expect(screen.getByText('Dimensiune')).toBeInTheDocument();
    expect(screen.getByText('A4')).toBeInTheDocument();
    expect(screen.getByText('A5')).toBeInTheDocument();
    expect(screen.queryByText('A3')).not.toBeInTheDocument();
  });

  it('renders printing and finishing sections', () => {
    renderPanel();
    expect(screen.getByText('Tipărire')).toBeInTheDocument();
    expect(screen.getByText('Finisare')).toBeInTheDocument();
  });

  it('reports a media selection', async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderPanel();

    await user.click(screen.getByText('170 GSM - Mat'));
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
