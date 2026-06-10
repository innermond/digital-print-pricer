import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrintingControl } from './PrintingControl';
import type { Printing } from '../../types';

const printing: Printing = { front: 'color', back: 'none' };

function group(heading: 'Față' | 'Verso') {
  const container = screen.getByRole('heading', { name: heading }).parentElement!;
  return within(container);
}

describe('PrintingControl', () => {
  it('shows color and black-only front options by default, all back options', () => {
    render(<PrintingControl printing={printing} onChange={() => {}} />);

    const front = group('Față');
    expect(front.getByRole('button', { name: 'Color' })).toBeInTheDocument();
    expect(front.getByRole('button', { name: 'Alb-negru' })).toBeInTheDocument();
    expect(front.queryByRole('button', { name: 'Neimprimat' })).not.toBeInTheDocument();

    const back = group('Verso');
    expect(back.getByRole('button', { name: 'Color' })).toBeInTheDocument();
    expect(back.getByRole('button', { name: 'Alb-negru' })).toBeInTheDocument();
    expect(back.getByRole('button', { name: 'Neimprimat' })).toBeInTheDocument();
  });

  it('changes the front ink', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PrintingControl printing={printing} onChange={onChange} />);

    await user.click(group('Față').getByRole('button', { name: 'Alb-negru' }));
    expect(onChange).toHaveBeenCalledWith({ front: 'black', back: 'none' });
  });

  it('changes the back ink', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PrintingControl printing={printing} onChange={onChange} />);

    await user.click(group('Verso').getByRole('button', { name: 'Color' }));
    expect(onChange).toHaveBeenCalledWith({ front: 'color', back: 'color' });
  });

  it('highlights the active inks', () => {
    render(<PrintingControl printing={{ front: 'color', back: 'none' }} onChange={() => {}} />);
    expect(group('Față').getByRole('button', { name: 'Color' })).toHaveClass('bg-blue-500');
    expect(group('Verso').getByRole('button', { name: 'Neimprimat' })).toHaveClass('bg-blue-500');
  });

  it('limits the options to the allowed inks', () => {
    render(
      <PrintingControl
        printing={printing}
        onChange={() => {}}
        allowedFronts={['color', 'none']}
        allowedBacks={['none']}
      />,
    );

    const front = group('Față');
    expect(front.getByRole('button', { name: 'Color' })).toBeInTheDocument();
    expect(front.getByRole('button', { name: 'Neimprimat' })).toBeInTheDocument();
    expect(front.queryByRole('button', { name: 'Alb-negru' })).not.toBeInTheDocument();

    const back = group('Verso');
    expect(back.getByRole('button', { name: 'Neimprimat' })).toBeInTheDocument();
    expect(back.queryByRole('button', { name: 'Color' })).not.toBeInTheDocument();
  });

  it('hides a side completely when it has no allowed inks', () => {
    render(<PrintingControl printing={printing} onChange={() => {}} allowedBacks={[]} />);
    expect(screen.getByRole('heading', { name: 'Față' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Verso' })).not.toBeInTheDocument();
  });

  it('renders nothing when no side has allowed inks', () => {
    const { container } = render(
      <PrintingControl printing={printing} onChange={() => {}} allowedFronts={[]} allowedBacks={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
