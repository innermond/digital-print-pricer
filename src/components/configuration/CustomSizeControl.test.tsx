import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomSizeControl } from './CustomSizeControl';
import { makeSize } from '../../test/fixtures';

// Split out of SizeSelector when the exact dimensions moved behind the
// "Opțiuni avansate" disclosure; these assertions came with them.
const a4 = makeSize();

function renderControl(overrides: Partial<Parameters<typeof CustomSizeControl>[0]> = {}) {
  const props = {
    currentSize: a4,
    customSizeUnit: 'mm' as const,
    onSizeChange: vi.fn(),
    onUnitChange: vi.fn(),
    ...overrides,
  };
  const utils = render(<CustomSizeControl {...props} />);
  return { ...utils, props };
}

describe('CustomSizeControl', () => {
  it('switches the unit and converts the current size', async () => {
    const user = userEvent.setup();
    const { props } = renderControl();

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
    const { props } = renderControl();

    fireEvent.change(screen.getByLabelText('Lățime (mm)'), { target: { value: '200' } });
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
    const { props } = renderControl();

    fireEvent.change(screen.getByLabelText('Înălțime (mm)'), { target: { value: '300' } });
    expect(props.onSizeChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'custom', heightMm: 300, widthMm: 210 }),
    );
  });

  it('shows the inputs in the active unit', () => {
    renderControl({ customSizeUnit: 'in' });
    expect(screen.getByLabelText('Lățime (in)')).toHaveValue('8.3');
    expect(screen.getByLabelText('Înălțime (in)')).toHaveValue('11.7');
  });

  it('labels each input so it is reachable by name', () => {
    renderControl();
    // Regression guard: these <label>s used to point at nothing.
    expect(screen.getByLabelText('Lățime (mm)')).toHaveAttribute('id');
    expect(screen.getByLabelText('Înălțime (mm)')).toHaveAttribute('id');
  });
});
