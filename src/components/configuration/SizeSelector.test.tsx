import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SizeSelector } from './SizeSelector';
import { makeSize } from '../../test/fixtures';
import type { Size } from '../../types';

const a4 = makeSize();
const a5 = makeSize({ id: 's2', label: 'A5', width: 148, height: 210, widthMm: 148, heightMm: 210 });
const sizes: Size[] = [a4, a5];

function renderSelector(overrides: Partial<Parameters<typeof SizeSelector>[0]> = {}) {
  const props = {
    sizes,
    currentSize: a4,
    customSizeUnit: 'mm' as const,
    recommendedSizeId: 's2',
    onSizeChange: vi.fn(),
    onRequestCustomSize: vi.fn(),
    ...overrides,
  };
  const utils = render(<SizeSelector {...props} />);
  return { ...utils, props };
}

describe('SizeSelector', () => {
  it('renders the presets and the custom option', () => {
    renderSelector();
    expect(screen.getByText('A4')).toBeInTheDocument();
    expect(screen.getByText('A5')).toBeInTheDocument();
    expect(screen.getByText('Personalizat')).toBeInTheDocument();
  });

  it('marks the recommended size with a star', () => {
    renderSelector();
    expect(screen.getByText('A5').closest('button')).toHaveTextContent('⭐');
    expect(screen.getByText('A4').closest('button')).not.toHaveTextContent('⭐');
  });

  it('highlights the preset matching the current size', () => {
    renderSelector();
    expect(screen.getByText('A4').closest('button')).toHaveClass('border-blue-400');
    expect(screen.getByText('Personalizat').closest('button')).not.toHaveClass('border-blue-400');
  });

  it('highlights the custom option when no preset matches', () => {
    renderSelector({
      currentSize: makeSize({ id: 'custom', label: 'Personalizat', width: 100, height: 100, widthMm: 100, heightMm: 100 }),
    });
    expect(screen.getByText('Personalizat').closest('button')).toHaveClass('border-blue-400');
  });

  it('selects a preset', async () => {
    const user = userEvent.setup();
    const { props } = renderSelector();

    await user.click(screen.getByText('A5'));
    expect(props.onSizeChange).toHaveBeenCalledWith({
      id: 's2',
      label: 'A5',
      width: 148,
      height: 210,
      widthMm: 148,
      heightMm: 210,
      unit: 'mm',
    });
  });

  it('asks for the exact-dimensions control when Personalizat is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderSelector();

    await user.click(screen.getByText('Personalizat'));
    expect(props.onRequestCustomSize).toHaveBeenCalled();
  });
});
