import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StapleControl } from './StapleControl';

const bothAllowed = { hole: true, staple: true };

describe('StapleControl', () => {
  it('renders the hole and staple options', () => {
    render(<StapleControl staple={undefined} allowed={bothAllowed} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Gaură pentru agățare' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Capsă' })).toBeInTheDocument();
  });

  it('toggles an option on', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StapleControl staple={{ hole: false, staple: false }} allowed={bothAllowed} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Gaură pentru agățare' }));
    expect(onChange).toHaveBeenCalledWith({ hole: true, staple: false });
  });

  it('toggles an option off', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StapleControl staple={{ hole: true, staple: true }} allowed={bothAllowed} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Capsă' }));
    expect(onChange).toHaveBeenCalledWith({ hole: true, staple: false });
  });

  it('treats a missing staple value as everything off', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StapleControl staple={undefined} allowed={bothAllowed} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Capsă' }));
    expect(onChange).toHaveBeenCalledWith({ hole: false, staple: true });
  });

  it('ignores clicks on options that are not allowed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <StapleControl staple={undefined} allowed={{ hole: false, staple: true }} onChange={onChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Gaură pentru agățare' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('highlights active options', () => {
    render(<StapleControl staple={{ hole: true, staple: false }} allowed={bothAllowed} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Gaură pentru agățare' })).toHaveClass('bg-blue-500');
    expect(screen.getByRole('button', { name: 'Capsă' })).not.toHaveClass('bg-blue-500');
  });
});
