import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoundedCornersControl } from './RoundedCornersControl';
import type { RoundedCorner } from '../../types';

const ALL_CORNERS: RoundedCorner[] = [1, 2, 3, 4];

describe('RoundedCornersControl', () => {
  it('renders a checkbox per corner', () => {
    render(<RoundedCornersControl corners={[]} allowedCorners={ALL_CORNERS} onChange={() => {}} />);
    expect(screen.getByRole('checkbox', { name: 'Stânga sus' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Dreapta sus' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Stânga jos' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Dreapta jos' })).toBeInTheDocument();
  });

  it('checks the boxes for the selected corners', () => {
    render(<RoundedCornersControl corners={[1, 4]} allowedCorners={ALL_CORNERS} onChange={() => {}} />);
    expect(screen.getByRole('checkbox', { name: 'Stânga sus' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Dreapta jos' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Dreapta sus' })).not.toBeChecked();
  });

  it('adds a corner when an unchecked box is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RoundedCornersControl corners={[1]} allowedCorners={ALL_CORNERS} onChange={onChange} />);

    await user.click(screen.getByRole('checkbox', { name: 'Dreapta sus' }));
    expect(onChange).toHaveBeenCalledWith([1, 2]);
  });

  it('removes a corner when a checked box is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RoundedCornersControl corners={[1, 2]} allowedCorners={ALL_CORNERS} onChange={onChange} />);

    await user.click(screen.getByRole('checkbox', { name: 'Stânga sus' }));
    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it('disables corners that are not allowed', () => {
    render(<RoundedCornersControl corners={[]} allowedCorners={[1, 2]} onChange={() => {}} />);
    expect(screen.getByRole('checkbox', { name: 'Stânga jos' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Stânga sus' })).toBeEnabled();
  });
});
