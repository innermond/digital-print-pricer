import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BindingControl } from './BindingControl';

describe('BindingControl', () => {
  it('renders a button per spiral color', () => {
    render(<BindingControl binding={undefined} allowedColors={['white', 'black']} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Alb' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Negru' })).toBeInTheDocument();
  });

  it('selects a color', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BindingControl binding={undefined} allowedColors={['white', 'black']} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Alb' }));
    expect(onChange).toHaveBeenCalledWith({ type: 'spiral', color: 'white' });
  });

  it('highlights the selected color', () => {
    render(
      <BindingControl
        binding={{ type: 'spiral', color: 'black' }}
        allowedColors={['white', 'black']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Negru' })).toHaveClass('bg-blue-500');
    expect(screen.getByRole('button', { name: 'Alb' })).not.toHaveClass('bg-blue-500');
  });

  it('ignores clicks on colors that are not allowed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BindingControl binding={undefined} allowedColors={['white']} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Negru' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
