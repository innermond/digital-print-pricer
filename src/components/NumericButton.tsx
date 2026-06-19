import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useLatestRef } from '../hooks/useLatestRef';
import { Badge } from './Badge';

type NumericButtonProps = {
  onClickMinus: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickPlus: () => void;
  value: number | string;
  style?: string;
  badgeText?: string;
};

const INITIAL_DELAY = 500;
const REPEAT_INTERVAL = 100;

export function NumericButton({
  style,
  value,
  onClickMinus,
  onChange,
  onClickPlus,
  badgeText,
}: NumericButtonProps) {
  // Keep refs to the latest handlers so a running repeat-interval always
  // calls the current closure (with up-to-date values), not the one
  // captured at the moment the button was pressed.
  const onClickPlusRef = useLatestRef(onClickPlus);
  const onClickMinusRef = useLatestRef(onClickMinus);

  const minusTimersRef = useRef<{ timeout: number | null; interval: number | null }>({
    timeout: null,
    interval: null,
  });
  const plusTimersRef = useRef<{ timeout: number | null; interval: number | null }>({
    timeout: null,
    interval: null,
  });

  const handleMouseDown = (
    handlerRef: React.RefObject<() => void>,
    timersRef: React.RefObject<{ timeout: number | null; interval: number | null }>,
  ) => {
    handlerRef.current();
    timersRef.current.timeout = window.setTimeout(() => {
      timersRef.current.interval = window.setInterval(() => {
        handlerRef.current();
      }, REPEAT_INTERVAL);
    }, INITIAL_DELAY);
  };

  const handleMouseUp = (timersRef: React.RefObject<{ timeout: number | null; interval: number | null }>) => {
    if (timersRef.current.timeout !== null) {
      window.clearTimeout(timersRef.current.timeout);
      timersRef.current.timeout = null;
    }
    if (timersRef.current.interval !== null) {
      window.clearInterval(timersRef.current.interval);
      timersRef.current.interval = null;
    }
  };

  useEffect(() => {
    return () => {
      handleMouseUp(plusTimersRef);
      handleMouseUp(minusTimersRef);
    };
  }, []);

  const widget = (
    <div className={"group/updown rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-600 text-sm text-slate-900 dark:text-slate-50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:focus:border-blue-600 dark:focus:ring-blue-600 flex items-center gap-1" + (style ? ' ' + style : '')}>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        size={Math.max(String(value).length, 1)}
        value={value}
        onChange={onChange}
        className="flex-1 text-center text-xs font-semibold text-slate-900 dark:text-slate-50 px-2 py-1.5"
      />
      <div className="flex flex-col gap-0 invisible group-hover/updown:visible">
        <button
          onMouseDown={() => handleMouseDown(onClickPlusRef, plusTimersRef)}
          onMouseUp={() => handleMouseUp(plusTimersRef)}
          onMouseLeave={() => handleMouseUp(plusTimersRef)}
          className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-500 rounded"
        >
          <ChevronUp size={14} className="text-slate-700 dark:text-slate-300" />
        </button>
        <button
          onMouseDown={() => handleMouseDown(onClickMinusRef, minusTimersRef)}
          onMouseUp={() => handleMouseUp(minusTimersRef)}
          onMouseLeave={() => handleMouseUp(minusTimersRef)}
          className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-500 rounded"
        >
          <ChevronDown size={14} className="text-slate-700 dark:text-slate-300" />
        </button>
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
