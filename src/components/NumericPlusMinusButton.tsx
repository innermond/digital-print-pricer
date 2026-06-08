import { Minus, Plus } from 'lucide-react';
import React, { useRef } from 'react';

type NumericPlusMinusButtonProps = {
  onClickMinus: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickPlus: (e: React.MouseEvent<HTMLButtonElement>) => void;
  value: number;
};

const INITIAL_DELAY = 500;
const REPEAT_INTERVAL = 100;

export function NumericPlusMinusButton({
  value,
  onClickMinus,
  onChange,
  onClickPlus,
}: NumericPlusMinusButtonProps) {
  const minusTimersRef = useRef<{ timeout: number | null; interval: number | null }>({
    timeout: null,
    interval: null,
  });
  const plusTimersRef = useRef<{ timeout: number | null; interval: number | null }>({
    timeout: null,
    interval: null,
  });

  const handleMouseDown = (
    handler: () => void,
    timersRef: React.MutableRefObject<{ timeout: number | null; interval: number | null }>,
  ) => {
    handler();
    timersRef.current.timeout = window.setTimeout(() => {
      timersRef.current.interval = window.setInterval(() => {
        handler();
      }, REPEAT_INTERVAL);
    }, INITIAL_DELAY);
  };

  const handleMouseUp = (timersRef: React.MutableRefObject<{ timeout: number | null; interval: number | null }>) => {
    if (timersRef.current.timeout !== null) {
      window.clearTimeout(timersRef.current.timeout);
      timersRef.current.timeout = null;
    }
    if (timersRef.current.interval !== null) {
      window.clearInterval(timersRef.current.interval);
      timersRef.current.interval = null;
    }
  };


  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-600 rounded px-2 py-1">
      <button
        onMouseDown={(e) => handleMouseDown(e => onClickMinus(e), minusTimersRef)}
        onMouseUp={() => handleMouseUp(minusTimersRef)}
        onMouseLeave={() => handleMouseUp(minusTimersRef)}
        className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-500 rounded"
      >
        <Minus size={14} className="text-slate-700 dark:text-slate-300" />
      </button>
      <input
        type="text"
        pattern="(?:0|[1-9]\d*)"
        inputMode="decimal"
        autoComplete="off"
        size={Math.max(String(value).length, 1)}
        value={value}
        onChange={onChange}
        className="text-center text-xs font-semibold text-slate-900 dark:text-slate-50"
      />
      <button
        onMouseDown={(e) => handleMouseDown(onClickPlus, plusTimersRef, e)}
        onMouseUp={() => handleMouseUp(plusTimersRef)}
        onMouseLeave={() => handleMouseUp(plusTimersRef)}
        className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-500 rounded"
      >
        <Plus size={14} className="text-slate-700 dark:text-slate-300" />
      </button>
    </div>
  );
}
