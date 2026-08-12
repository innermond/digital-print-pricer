import { useId } from 'react';
import { Badge } from '../Badge';

type CreasingControlProps = {
  count: number;
  allowedCounts: number[];
  onChange: (count: number) => void;
  badgeText?: string;
};

export function CreasingControl({ count, allowedCounts, onChange, badgeText }: CreasingControlProps) {
  const headingId = useId();
  const sliderId = useId();
  const disabled = allowedCounts.length === 0;
  // With a single count on offer the slider would accept a drag and snap straight
  // back, so show the value on its own instead.
  const fixed = allowedCounts.length === 1;

  const widget = (
    <div className={`rounded-lg bg-slate-50 dark:bg-slate-700 p-3 ${disabled ? 'opacity-50' : ''}`}>
      <h4 id={headingId} className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <label htmlFor={sliderId}>Biguitură</label>
      </h4>
      <div className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed' : ''}`}>
        {!fixed && (
          <input
            id={sliderId}
            type="range"
            min="0"
            max="5"
            value={count}
            aria-valuetext={String(count)}
            disabled={disabled}
            onChange={(e) => {
              const next = parseInt(e.target.value);
              if (!allowedCounts.includes(next)) return;
              onChange(next);
            }}
            className={`w-24 ${disabled ? 'pointer-events-none' : 'accent-blue-500 dark:accent-blue-400'}`}
          />
        )}
        <span className="text-xs font-medium text-slate-900 dark:text-slate-50 w-6 text-center">
          {count}
        </span>
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
