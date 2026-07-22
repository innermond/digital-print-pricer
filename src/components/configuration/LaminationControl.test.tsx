import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LaminationControl } from './LaminationControl';
import type { LaminationType, LaminationSides } from '../../types';

const ALL_TYPES: LaminationType[] = ['gloss', 'matt', 'soft-touch'];
const ALL_SIDES: LaminationSides[] = ['front', 'back', 'both'];

describe('LaminationControl', () => {
  it('renders all lamination types', () => {
    render(
      <LaminationControl
        lamination={{ type: 'none', sides: 'front' }}
        allowedTypes={ALL_TYPES}
        allowedSides={ALL_SIDES}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Fără' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lucios' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Soft-touch' })).toBeInTheDocument();
  });

  it('selects a lamination type', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LaminationControl
        lamination={{ type: 'none', sides: 'front' }}
        allowedTypes={ALL_TYPES}
        allowedSides={ALL_SIDES}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Lucios' }));
    expect(onChange).toHaveBeenCalledWith({ type: 'gloss', sides: 'front' });
  });

  it('ignores clicks on types that are not allowed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LaminationControl
        lamination={{ type: 'none', sides: 'front' }}
        allowedTypes={[]}
        allowedSides={ALL_SIDES}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Lucios' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Lucios' })).toHaveClass('cursor-not-allowed');
  });

  it('hides the sides selector while lamination is off', () => {
    render(
      <LaminationControl
        lamination={{ type: 'none', sides: 'front' }}
        allowedTypes={ALL_TYPES}
        allowedSides={ALL_SIDES}
        onChange={() => {}}
      />,
    );
    expect(screen.queryByText('Aplică pe:')).not.toBeInTheDocument();
  });

  it('shows the sides selector once a lamination type is active', () => {
    render(
      <LaminationControl
        lamination={{ type: 'gloss', sides: 'front' }}
        allowedTypes={ALL_TYPES}
        allowedSides={ALL_SIDES}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Aplică pe:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Față' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Spate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ambele' })).toBeInTheDocument();
  });

  it('changes the lamination sides', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LaminationControl
        lamination={{ type: 'gloss', sides: 'front' }}
        allowedTypes={ALL_TYPES}
        allowedSides={ALL_SIDES}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Ambele' }));
    expect(onChange).toHaveBeenCalledWith({ type: 'gloss', sides: 'both' });
  });

  it('ignores clicks on sides that are not allowed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LaminationControl
        lamination={{ type: 'gloss', sides: 'front' }}
        allowedTypes={ALL_TYPES}
        allowedSides={['front']}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Spate' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Spate' })).toHaveClass('cursor-not-allowed');
    expect(screen.getByRole('button', { name: 'Ambele' })).toHaveClass('cursor-not-allowed');
  });
});
