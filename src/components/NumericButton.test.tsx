import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { NumericButton } from './NumericButton';

function renderNumericButton(overrides: Partial<Parameters<typeof NumericButton>[0]> = {}) {
  const props = {
    value: 5,
    onClickMinus: vi.fn(),
    onChange: vi.fn(),
    onClickPlus: vi.fn(),
    ...overrides,
  };
  const utils = render(<NumericButton {...props} />);
  const [plusButton, minusButton] = utils.container.querySelectorAll('button');
  return { ...utils, props, plusButton, minusButton };
}

describe('NumericButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the value in the input', () => {
    renderNumericButton({ value: 42 });
    expect(screen.getByRole('textbox')).toHaveValue('42');
  });

  it('calls onChange when the input changes', () => {
    const { props } = renderNumericButton();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '7' } });
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onClickPlus once on a short press', () => {
    const { props, plusButton } = renderNumericButton();
    fireEvent.mouseDown(plusButton);
    fireEvent.mouseUp(plusButton);
    expect(props.onClickPlus).toHaveBeenCalledTimes(1);
    expect(props.onClickMinus).not.toHaveBeenCalled();
  });

  it('calls onClickMinus once on a short press', () => {
    const { props, minusButton } = renderNumericButton();
    fireEvent.mouseDown(minusButton);
    fireEvent.mouseUp(minusButton);
    expect(props.onClickMinus).toHaveBeenCalledTimes(1);
    expect(props.onClickPlus).not.toHaveBeenCalled();
  });

  it('repeats while held and stops on mouse up', () => {
    const { props, plusButton } = renderNumericButton();
    fireEvent.mouseDown(plusButton);
    expect(props.onClickPlus).toHaveBeenCalledTimes(1);

    // 500ms initial delay, then one repeat every 100ms
    vi.advanceTimersByTime(500 + 300);
    expect(props.onClickPlus).toHaveBeenCalledTimes(4);

    fireEvent.mouseUp(plusButton);
    vi.advanceTimersByTime(1000);
    expect(props.onClickPlus).toHaveBeenCalledTimes(4);
  });

  it('stops repeating when the pointer leaves the button', () => {
    const { props, plusButton } = renderNumericButton();
    fireEvent.mouseDown(plusButton);
    vi.advanceTimersByTime(500 + 100);
    expect(props.onClickPlus).toHaveBeenCalledTimes(2);

    fireEvent.mouseLeave(plusButton);
    vi.advanceTimersByTime(1000);
    expect(props.onClickPlus).toHaveBeenCalledTimes(2);
  });

  it('uses the latest handler during a running repeat', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { plusButton, rerender, props } = renderNumericButton({ onClickPlus: first });

    fireEvent.mouseDown(plusButton);
    vi.advanceTimersByTime(500 + 100);
    expect(first).toHaveBeenCalledTimes(2);

    rerender(<NumericButton {...props} onClickPlus={second} />);
    vi.advanceTimersByTime(100);
    expect(first).toHaveBeenCalledTimes(2);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('wraps the widget in a Badge when badgeText is given', () => {
    renderNumericButton({ badgeText: 'helpful hint' });
    expect(screen.getByText('helpful hint')).toBeInTheDocument();
  });

  it('renders no badge without badgeText', () => {
    renderNumericButton();
    expect(screen.queryByText('ⓘ')).not.toBeInTheDocument();
  });
});
