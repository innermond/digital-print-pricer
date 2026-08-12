import { useId } from 'react';
import type { RoundedCorner, Finishing } from '../../types';
import { Badge } from '../Badge';

const ROUNDED_CORNERS: Array<{ value: RoundedCorner; label: string }> = [
  { value: 1, label: 'Stânga sus' },
  { value: 2, label: 'Dreapta sus' },
  { value: 3, label: 'Stânga jos' },
  { value: 4, label: 'Dreapta jos' },
];

type RoundedCornersControlProps = {
  corners: Finishing['roundedCornes']['corners'];
  allowedCorners: RoundedCorner[];
  onChange: (corners: RoundedCorner[]) => void;
  badgeText?: string;
};

export function RoundedCornersControl({ corners, allowedCorners, onChange, badgeText }: RoundedCornersControlProps) {
  const headingId = useId();
  const base = 'flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition border';
  const enabledCls =
    'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400 cursor-pointer';
  const disabledCls =
    'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-500 cursor-not-allowed';

  const widget = (
    <div role="group" aria-labelledby={headingId} className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
      <h4 id={headingId} className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Colțuri Rotunjite</h4>
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

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
