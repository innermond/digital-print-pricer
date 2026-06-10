import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PageCountControl } from './PageCountControl';

const constraint = { of: 4, min: 8, max: 64 };

function renderControl(pageCount: number) {
  const onChange = vi.fn();
  const { container } = render(
    <PageCountControl pageCount={pageCount} constraint={constraint} onChange={onChange} />,
  );
  const [plusButton, minusButton] = container.querySelectorAll('button');
  return { onChange, plusButton, minusButton };
}

const press = (button: Element) => {
  fireEvent.mouseDown(button);
  fireEvent.mouseUp(button);
};

describe('PageCountControl', () => {
  it('shows the page count and the constraint', () => {
    renderControl(16);
    expect(screen.getByRole('textbox')).toHaveValue('16');
    expect(screen.getByText('multipli de 4, 8–64')).toBeInTheDocument();
  });

  it('steps up by the multiple', () => {
    const { onChange, plusButton } = renderControl(16);
    press(plusButton);
    expect(onChange).toHaveBeenCalledWith(20);
  });

  it('steps down by the multiple', () => {
    const { onChange, minusButton } = renderControl(16);
    press(minusButton);
    expect(onChange).toHaveBeenCalledWith(12);
  });

  it('clamps at the minimum', () => {
    const { onChange, minusButton } = renderControl(8);
    press(minusButton);
    expect(onChange).toHaveBeenCalledWith(8);
  });

  it('clamps at the maximum', () => {
    const { onChange, plusButton } = renderControl(64);
    press(plusButton);
    expect(onChange).toHaveBeenCalledWith(64);
  });

  it('snaps typed values to the nearest multiple within bounds', () => {
    const { onChange } = renderControl(16);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '15' } });
    expect(onChange).toHaveBeenCalledWith(16);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '200' } });
    expect(onChange).toHaveBeenCalledWith(64);
  });

  it('ignores non-numeric input', () => {
    const { onChange } = renderControl(16);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } });
    expect(onChange).not.toHaveBeenCalled();
  });
});
