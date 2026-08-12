import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('hides lamination, creasing and rounded corners when the media disallows them', () => {
    // 120 GSM paper: under 200 (no creasing) and under 170 (no lamination, no rounded corners).
    const thin = makeElemental({ media: makePaper({ id: 'p2', gsm: 120 }) });
    render(<FinishingOptions element={thin} config={config} onUpdate={() => {}} />);
    expect(screen.queryByRole('heading', { name: 'Laminare' })).not.toBeInTheDocument();
    expect(screen.queryByText('Biguitură')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Colțuri Rotunjite' })).not.toBeInTheDocument();
  });

  it('hides folding when the config offers no real fold', () => {
    const noFolds = makeConfig({ allowedFoldTypes: ['none'] });
    const { rerender } = render(
      <FinishingOptions element={element} config={noFolds} onUpdate={() => {}} />,
    );
    expect(screen.queryByRole('heading', { name: 'Pliere' })).not.toBeInTheDocument();

    rerender(<FinishingOptions element={element} config={config} onUpdate={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Pliere' })).toBeInTheDocument();
  });

  it('renders nothing at all when every finishing is ruled out', () => {
    const thin = makeElemental({ media: makePaper({ id: 'p2', gsm: 120 }) });
    const noFolds = makeConfig({ allowedFoldTypes: ['none'] });
    const { container } = render(
      <FinishingOptions element={thin} config={noFolds} onUpdate={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Finisare')).not.toBeInTheDocument();
  });

  it('still lets the fold be cleared — the control gets the unfiltered list', () => {
    // 120 GSM hides the Laminare panel, so the only 'Fără' left is the folding one.
    const thin = makeElemental({ media: makePaper({ id: 'p2', gsm: 120 }) });
    render(<FinishingOptions element={thin} config={config} onUpdate={() => {}} />);
    expect(screen.getByRole('button', { name: 'Fără' })).toBeEnabled();
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

  it('keeps the creasing cap when the chosen count changes', () => {
    // Regression: the slider used to write `creasing: { count }`, replacing the
    // object and dropping the catalog's `max`. On the next render the cap was
    // gone, the product-level rule took over, and the control unmounted itself
    // the moment you used it.
    const onUpdate = vi.fn();
    const capped = makeElemental({
      finishing: makeFinishing({ creasing: { count: 0, max: 3 } }),
    });
    render(
      <FinishingOptions
        element={capped}
        config={makeConfig({ allowedCreasingCounts: [] })}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.change(screen.getByRole('slider'), { target: { value: '2' } });

    expect(onUpdate).toHaveBeenCalledWith({
      finishing: makeFinishing({ creasing: { count: 2, max: 3 } }),
    });
  });

  it('keeps showing the creasing control after a change', () => {
    // The same regression seen end to end: re-render with what onUpdate produced
    // and the slider must still be there.
    const capped = makeElemental({
      finishing: makeFinishing({ creasing: { count: 0, max: 3 } }),
    });
    const noProductCreasing = makeConfig({ allowedCreasingCounts: [] });
    let current = capped;
    const onUpdate = vi.fn((updates) => {
      current = { ...current, ...updates };
    });

    const { rerender } = render(
      <FinishingOptions element={current} config={noProductCreasing} onUpdate={onUpdate} />,
    );
    expect(screen.getByRole('slider')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider'), { target: { value: '2' } });
    rerender(
      <FinishingOptions element={current} config={noProductCreasing} onUpdate={onUpdate} />,
    );

    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('2');
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
