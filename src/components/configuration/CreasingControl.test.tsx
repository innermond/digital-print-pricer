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
    render(<CreasingControl count={0} allowedCounts={[0, 2]} onChange={onChange} />);

    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('caps the slider track at the allowed max, not the full 0–5 range', () => {
    render(<CreasingControl count={2} allowedCounts={[0, 1, 2]} onChange={() => {}} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '2');

    // The track itself won't accept a drag past its max, so a value of 5 is
    // clamped before it ever reaches onChange — unlike the old hardcoded 0–5
    // range, which let the thumb overshoot a lower max like 2.
    fireEvent.change(slider, { target: { value: '5' } });
    expect(slider.value).toBe('2');
  });

  it('disables the slider when no counts are allowed', () => {
    render(<CreasingControl count={0} allowedCounts={[]} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('drops the slider entirely when exactly one count is allowed', () => {
    render(<CreasingControl count={2} allowedCounts={[2]} onChange={() => {}} />);
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(screen.getByText('Biguitură')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
