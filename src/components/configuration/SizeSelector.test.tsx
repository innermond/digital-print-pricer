import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SizeSelector } from './SizeSelector';
import { makeSize } from '../../test/fixtures';
import type { Size } from '../../types';

const a4 = makeSize();
const a5 = makeSize({ id: 's2', label: 'A5', width: 148, height: 210, widthMm: 148, heightMm: 210 });
const a3plus = makeSize({ id: 's7', label: 'A3+', width: 320, height: 450, widthMm: 320, heightMm: 450 });
const sizes: Size[] = [a4, a5];
const landscapeA4 = makeSize({ width: 297, height: 210, widthMm: 297, heightMm: 210 });

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
  describe('orientation', () => {
    it('recognises a rotated preset instead of calling it custom', () => {
      renderSelector({ currentSize: landscapeA4 });

      expect(screen.getByText('A4 orizontal').closest('button')).toHaveClass('border-blue-400');
      expect(screen.getByText('Personalizat').closest('button')).not.toHaveClass('border-blue-400');
    });

    it('shows the rotated dimensions on the matched preset', () => {
      renderSelector({ currentSize: landscapeA4 });

      expect(screen.getByText('A4 orizontal').closest('button')).toHaveTextContent('297.0 × 210.0 mm');
    });

    it('does not name a preset the product withheld', () => {
      // A3+ is in the catalog but was kept out of `sizes` — by the press
      // ceiling, say. Naming the custom card after it would offer back the
      // option the panel just took away.
      renderSelector({ currentSize: a3plus, presets: [...sizes, a3plus] });

      expect(screen.queryByText('A3+')).not.toBeInTheDocument();
      expect(screen.getByText('Personalizat').closest('button')).toHaveClass('border-blue-400');
    });

    it('still says Personalizat for dimensions no preset covers', () => {
      renderSelector({
        currentSize: makeSize({ id: 'custom', label: 'Personalizat', width: 213, height: 301, widthMm: 213, heightMm: 301 }),
      });

      expect(screen.getByText('Personalizat').closest('button')).toHaveClass('border-blue-400');
    });

    it('rotates the current size', async () => {
      const user = userEvent.setup();
      const { props } = renderSelector();

      await user.click(screen.getByRole('button', { name: 'Rotește dimensiunea' }));
      expect(props.onSizeChange).toHaveBeenCalledWith({
        id: 's1',
        label: 'A4 orizontal',
        width: 297,
        height: 210,
        widthMm: 297,
        heightMm: 210,
        unit: 'mm',
      });
    });

    it('offers no rotation for a square size', () => {
      renderSelector({
        currentSize: makeSize({ width: 100, height: 100, widthMm: 100, heightMm: 100 }),
      });

      expect(screen.queryByRole('button', { name: 'Rotește dimensiunea' })).not.toBeInTheDocument();
    });
  });

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

  it('notes that some presets are hidden by the machine limit', () => {
    renderSelector({ machineLimitHidesSizes: true });
    expect(screen.getByText(/depășesc limita presei/)).toBeInTheDocument();
  });

  it('shows no note when nothing was hidden by the machine', () => {
    renderSelector();
    expect(screen.queryByText(/depășesc limita presei/)).not.toBeInTheDocument();
  });
});
