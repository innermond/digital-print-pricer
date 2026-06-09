type CreasingControlProps = {
  count: number;
  allowedCounts: number[];
  onChange: (count: number) => void;
};

export function CreasingControl({ count, allowedCounts, onChange }: CreasingControlProps) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <label className="flex items-center justify-between gap-2 text-xs font-medium text-slate-900 dark:text-slate-50 mb-2">
        Creasing
      </label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="5"
          value={count}
          onChange={(e) => {
            const next = parseInt(e.target.value);
            if (!allowedCounts.includes(next)) return;
            onChange(next);
          }}
          className={
            'flex-1 ' +
            (allowedCounts.length > 0
              ? 'accent-blue-500 dark:accent-blue-400'
              : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed')
          }
        />
        <span className="text-xs font-medium text-slate-900 dark:text-slate-50 w-6 text-center">
          {count}
        </span>
      </div>
    </div>
  );
}
