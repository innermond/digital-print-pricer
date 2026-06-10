import type { Staple } from '../../types';
import { Badge } from '../Badge';

const DEFAULT_STAPLE: Staple = { hole: false, staple: false };

type StapleOption = { key: keyof Staple; label: string };

const STAPLE_OPTIONS: StapleOption[] = [
  { key: 'hole', label: 'Gaură pentru agățare' },
  { key: 'staple', label: 'Capsă' },
];

type StapleControlProps = {
  staple: Staple | undefined;
  allowed: Staple;
  onChange: (staple: Staple) => void;
  badgeText?: string;
};

export function StapleControl({ staple, allowed, onChange, badgeText }: StapleControlProps) {
  const current = staple ?? DEFAULT_STAPLE;

  const widget = (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Capsare</h4>
      <div className="flex flex-wrap gap-1.5">
        {STAPLE_OPTIONS.map(({ key, label }) => {
          const isAllowed = allowed[key];
          const active = current[key];
          return (
            <button
              key={key}
              onClick={() => {
                if (!isAllowed) return;
                onChange({ ...current, [key]: !active });
              }}
              className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
                !isAllowed && !active
                  ? 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : active
                  ? 'bg-blue-500 dark:bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
