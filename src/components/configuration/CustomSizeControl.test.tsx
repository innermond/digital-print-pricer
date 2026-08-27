import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomSizeControl } from './CustomSizeControl';
import { makeSize } from '../../test/fixtures';

// Split out of SizeSelector when the exact dimensions moved behind the
// "Opțiuni avansate" disclosure; these assertions came with them.
const a4 = makeSize();
const a5 = makeSize({ id: 's2', label: 'A5', width: 148, height: 210, widthMm: 148, heightMm: 210 });
const card = makeSize({ id: 's5', label: 'Carte Vizită Standard', width: 90, height: 50, widthMm: 90, heightMm: 50 });
const presets = [a4, a5, card];

function renderControl(overrides: Partial<Parameters<typeof CustomSizeControl>[0]> = {}) {
  const props = {
    currentSize: a4,
    presets,
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

  it('names a rotated preset rather than calling it custom', () => {
    const { props } = renderControl({
      currentSize: makeSize({ width: 210, height: 210, widthMm: 210, heightMm: 210 }),
    });

    // Height 210 already; typing a width of 297 makes it an A4 lying down.
    fireEvent.change(screen.getByLabelText('Lățime (mm)'), { target: { value: '297' } });
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

  it('calls a preset that is already wide vertical when stood up', () => {
    const { props } = renderControl({
      currentSize: makeSize({ width: 50, height: 50, widthMm: 50, heightMm: 50 }),
    });

    fireEvent.change(screen.getByLabelText('Înălțime (mm)'), { target: { value: '90' } });
    expect(props.onSizeChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 's5', label: 'Carte Vizită Standard vertical' }),
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

  it('clamps a typed width to the machine max', () => {
    const { props } = renderControl({ maxWidthMm: 320 });

    fireEvent.change(screen.getByLabelText(/Lățime/), { target: { value: '500' } });
    expect(props.onSizeChange).toHaveBeenCalledWith(
      expect.objectContaining({ width: 320, widthMm: 320 }),
    );
  });

  it('clamps a typed height to the machine max', () => {
    const { props } = renderControl({ maxHeightMm: 450 });

    fireEvent.change(screen.getByLabelText(/Înălțime/), { target: { value: '900' } });
    expect(props.onSizeChange).toHaveBeenCalledWith(
      expect.objectContaining({ height: 450, heightMm: 450 }),
    );
  });

  it('does not clamp a value within the machine max', () => {
    const { props } = renderControl({ maxWidthMm: 320 });

    fireEvent.change(screen.getByLabelText(/Lățime/), { target: { value: '250' } });
    expect(props.onSizeChange).toHaveBeenCalledWith(
      expect.objectContaining({ width: 250, widthMm: 250 }),
    );
  });

  it('stops the "+" stepper from going past the machine max', async () => {
    const user = userEvent.setup();
    const { props } = renderControl({
      currentSize: makeSize({ width: 320, height: 297, widthMm: 320, heightMm: 297 }),
      maxWidthMm: 320,
    });

    // Both fields' "+" buttons share the same accessible name; index 0 is width.
    await user.click(screen.getAllByRole('button', { name: 'Crește' })[0]);
    expect(props.onSizeChange).toHaveBeenCalledWith(
      expect.objectContaining({ width: 320, widthMm: 320 }),
    );
  });

  it('shows the machine max as a hint on the label', () => {
    renderControl({ maxWidthMm: 320, maxHeightMm: 450 });
    expect(screen.getByLabelText('Lățime (mm) · max 320')).toBeInTheDocument();
    expect(screen.getByLabelText('Înălțime (mm) · max 450')).toBeInTheDocument();
  });

  it('shows no max hint when there is no machine ceiling', () => {
    renderControl();
    expect(screen.getByLabelText('Lățime (mm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Înălțime (mm)')).toBeInTheDocument();
  });
});
