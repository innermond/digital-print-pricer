import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
    onUnitChange: vi.fn(),
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

  it('switches the unit and converts the current size', async () => {
    const user = userEvent.setup();
    const { props } = renderSelector();

    await user.click(screen.getByRole('button', { name: 'in' }));
    expect(props.onUnitChange).toHaveBeenCalledWith('in');
    expect(props.onSizeChange).toHaveBeenCalledWith({
      ...a4,
      width: 8.27,  // 210 mm
      height: 11.69, // 297 mm
      unit: 'in',
    });
  });

  it('reports a custom width as a custom size', () => {
    const { props } = renderSelector();
    const [widthInput] = screen.getAllByRole('textbox');

    fireEvent.change(widthInput, { target: { value: '200' } });
    expect(props.onSizeChange).toHaveBeenCalledWith({
      id: 'custom',
      label: 'Personalizat',
      width: 200,
      height: 297,
      widthMm: 200,
      heightMm: 297,
      unit: 'mm',
    });
  });

  it('reports a custom height as a custom size', () => {
    const { props } = renderSelector();
    const [, heightInput] = screen.getAllByRole('textbox');

    fireEvent.change(heightInput, { target: { value: '300' } });
    expect(props.onSizeChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'custom', heightMm: 300, widthMm: 210 }),
    );
  });

  it('shows the custom inputs in the active unit', () => {
    renderSelector({ customSizeUnit: 'in' });
    const [widthInput, heightInput] = screen.getAllByRole('textbox');
    expect(widthInput).toHaveValue('8.3');
    expect(heightInput).toHaveValue('11.7');
  });
});
