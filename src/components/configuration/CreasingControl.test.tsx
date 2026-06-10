import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CreasingControl } from './CreasingControl';

const ALL_COUNTS = [0, 1, 2, 3, 4, 5];

describe('CreasingControl', () => {
  it('shows the current count', () => {
    render(<CreasingControl count={2} allowedCounts={ALL_COUNTS} onChange={() => {}} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('2');
  });

  it('reports a new count from the slider', () => {
    const onChange = vi.fn();
    render(<CreasingControl count={2} allowedCounts={ALL_COUNTS} onChange={onChange} />);

    fireEvent.change(screen.getByRole('slider'), { target: { value: '4' } });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('ignores counts that are not allowed', () => {
    const onChange = vi.fn();
    render(<CreasingControl count={1} allowedCounts={[0, 1, 2]} onChange={onChange} />);

    fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables the slider when no counts are allowed', () => {
    render(<CreasingControl count={0} allowedCounts={[]} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toBeDisabled();
  });
});
