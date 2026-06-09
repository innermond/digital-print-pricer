import type { RoundedCorner, Finishing } from '../../types';

const ROUNDED_CORNERS: Array<{ value: RoundedCorner; label: string }> = [
  { value: 1, label: 'Top-left' },
  { value: 2, label: 'Top-right' },
  { value: 3, label: 'Bottom-left' },
  { value: 4, label: 'Bottom-right' },
];

type RoundedCornersControlProps = {
  corners: Finishing['roundedCornes']['corners'];
  allowedCorners: RoundedCorner[];
  onChange: (corners: RoundedCorner[]) => void;
};

export function RoundedCornersControl({ corners, allowedCorners, onChange }: RoundedCornersControlProps) {
  const base = 'flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition border';
  const enabledCls =
    'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400 cursor-pointer';
  const disabledCls =
    'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-500 cursor-not-allowed';

  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Rounded Corners</h4>
      <div className="flex flex-wrap gap-1.5">
        {ROUNDED_CORNERS.map(({ value, label }) => {
          const allowed = allowedCorners.includes(value);
          const checked = corners.includes(value);
          return (
            <label key={value} className={`flex-1 min-w-24 ${base} ${allowed ? enabledCls : disabledCls}`}>
              <input
                type="checkbox"
                checked={checked}
                disabled={!allowed}
                onChange={() => {
                  if (!allowed) return;
                  onChange(
                    checked
                      ? corners.filter((c) => c !== value)
                      : [...corners, value]
                  );
                }}
                className="accent-blue-500 dark:accent-blue-400 disabled:cursor-not-allowed"
              />
              {label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
