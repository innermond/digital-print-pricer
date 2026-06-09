import { Badge } from '../Badge';

type CreasingControlProps = {
  count: number;
  allowedCounts: number[];
  onChange: (count: number) => void;
  badgeText?: string;
};

export function CreasingControl({ count, allowedCounts, onChange, badgeText }: CreasingControlProps) {
  const disabled = allowedCounts.length === 0;

  const widget = (
    <div className={`rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5 ${disabled ? 'opacity-50' : ''}`}>
      <label className="flex items-center justify-between gap-2 text-xs font-medium text-slate-900 dark:text-slate-50 mb-2">
        Creasing
      </label>
      <div className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed' : ''}`}>
        <input
          type="range"
          min="0"
          max="5"
          value={count}
          disabled={disabled}
          onChange={(e) => {
            const next = parseInt(e.target.value);
            if (!allowedCounts.includes(next)) return;
            onChange(next);
          }}
          className={`flex-1 ${disabled ? 'pointer-events-none' : 'accent-blue-500 dark:accent-blue-400'}`}
        />
        <span className="text-xs font-medium text-slate-900 dark:text-slate-50 w-6 text-center">
          {count}
        </span>
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
