import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PunchHoleControl } from './PunchHoleControl';

describe('PunchHoleControl', () => {
  it('states the hole is included when enabled', () => {
    render(<PunchHoleControl enabled onChange={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Gaură de agățare' })).toBeInTheDocument();
    expect(screen.getByText('Gaură inclusă')).toBeInTheDocument();
  });

  it('states the hole is excluded when disabled', () => {
    render(<PunchHoleControl enabled={false} onChange={vi.fn()} />);
    expect(screen.getByText('Gaură exclusă')).toBeInTheDocument();
  });

  it('offers a button that reports the hole is currently on', () => {
    render(<PunchHoleControl enabled onChange={vi.fn()} />);
    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
  });

  it('toggles off when clicked while enabled', async () => {
    const onChange = vi.fn();
    render(<PunchHoleControl enabled onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('toggles on when clicked while disabled', async () => {
    const onChange = vi.fn();
    render(<PunchHoleControl enabled={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
