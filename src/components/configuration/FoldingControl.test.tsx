import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FoldingControl } from './FoldingControl';

describe('FoldingControl', () => {
  it('renders all fold types', () => {
    render(
      <FoldingControl folding={{ type: 'none', folds: 0 }} allowedFoldTypes={['none']} onChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Fără' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pliere la jumătate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pliere în trei' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pliere Z' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pliere poartă' })).toBeInTheDocument();
  });

  it('disables fold types that are not allowed', () => {
    render(
      <FoldingControl
        folding={{ type: 'none', folds: 0 }}
        allowedFoldTypes={['none', 'half-fold']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Pliere la jumătate' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Pliere Z' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pliere poartă' })).toBeDisabled();
  });

  it('treats "none" as allowed when no fold types are configured', () => {
    render(
      <FoldingControl folding={{ type: 'none', folds: 0 }} allowedFoldTypes={[]} onChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Fără' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Pliere la jumătate' })).toBeDisabled();
  });

  it('selects a fold type with at least one fold', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FoldingControl
        folding={{ type: 'none', folds: 0 }}
        allowedFoldTypes={['none', 'half-fold']}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Pliere la jumătate' }));
    expect(onChange).toHaveBeenCalledWith({ type: 'half-fold', folds: 1 });
  });

  it('keeps the existing fold count when switching between fold types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FoldingControl
        folding={{ type: 'half-fold', folds: 2 }}
        allowedFoldTypes={['half-fold', 'tri-fold']}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Pliere în trei' }));
    expect(onChange).toHaveBeenCalledWith({ type: 'tri-fold', folds: 2 });
  });

  it('resets folds to zero when selecting "none"', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FoldingControl
        folding={{ type: 'half-fold', folds: 1 }}
        allowedFoldTypes={['none', 'half-fold']}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Fără' }));
    expect(onChange).toHaveBeenCalledWith({ type: 'none', folds: 0 });
  });

  it('highlights the selected fold type', () => {
    render(
      <FoldingControl
        folding={{ type: 'half-fold', folds: 1 }}
        allowedFoldTypes={['none', 'half-fold']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Pliere la jumătate' })).toHaveClass('bg-blue-500');
  });
});
