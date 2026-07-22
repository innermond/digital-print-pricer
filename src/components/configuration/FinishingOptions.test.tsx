import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FinishingOptions } from './FinishingOptions';
import { makeConfig, makeElemental, makeFinishing, makePaper } from '../../test/fixtures';

// 250 GSM paper allows lamination, creasing and rounded corners
const element = makeElemental();
const config = makeConfig({ allowedFoldTypes: ['none', 'half-fold'] });

describe('FinishingOptions', () => {
  it('renders all finishing sub-controls', () => {
    render(<FinishingOptions element={element} config={config} onUpdate={() => {}} />);
    expect(screen.getByText('Finisare')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Laminare' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pliere' })).toBeInTheDocument();
    expect(screen.getByText('Biguitură')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Colțuri Rotunjite' })).toBeInTheDocument();
  });

  it('hides creasing and rounded corners when the media disallows them', () => {
    // 120 GSM paper: under 200 (no creasing) and under 170 (no rounded corners).
    const thin = makeElemental({ media: makePaper({ id: 'p2', gsm: 120 }) });
    render(<FinishingOptions element={thin} config={config} onUpdate={() => {}} />);
    expect(screen.queryByText('Biguitură')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Colțuri Rotunjite' })).not.toBeInTheDocument();
  });

  it('shows the staple control only when the config allows stapling', () => {
    const { rerender } = render(
      <FinishingOptions element={element} config={config} onUpdate={() => {}} />,
    );
    expect(screen.queryByRole('heading', { name: 'Capsare' })).not.toBeInTheDocument();

    rerender(
      <FinishingOptions
        element={element}
        config={makeConfig({ allowedStaple: { hole: true, staple: true } })}
        onUpdate={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Capsare' })).toBeInTheDocument();
  });

  it('merges a lamination change into the finishing', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(<FinishingOptions element={element} config={config} onUpdate={onUpdate} />);

    await user.click(screen.getByRole('button', { name: 'Lucios' }));
    expect(onUpdate).toHaveBeenCalledWith({
      finishing: makeFinishing({ lamination: { type: 'gloss', sides: 'front' } }),
    });
  });

  it('merges a folding change into the finishing', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(<FinishingOptions element={element} config={config} onUpdate={onUpdate} />);

    await user.click(screen.getByRole('button', { name: 'Pliere la jumătate' }));
    expect(onUpdate).toHaveBeenCalledWith({
      finishing: makeFinishing({ folding: { type: 'half-fold', folds: 1 } }),
    });
  });

  it('derives the page count from the fold when the config says so', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const derivedConfig = makeConfig({
      allowedFoldTypes: ['none', 'half-fold'],
      elementalPageCounts: { [element.id]: { kind: 'derived' } },
    });
    render(<FinishingOptions element={element} config={derivedConfig} onUpdate={onUpdate} />);

    await user.click(screen.getByRole('button', { name: 'Pliere la jumătate' }));
    expect(onUpdate).toHaveBeenCalledWith({
      finishing: makeFinishing({ folding: { type: 'half-fold', folds: 1 } }),
      pageCount: 4,
    });
  });
});
