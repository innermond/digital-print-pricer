import { useId } from 'react';
import type { Staple } from '../../types';
import { Badge } from '../Badge';
import { optionButtonClass } from '../../lib/optionButton';

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
  const headingId = useId();
  const current = staple ?? DEFAULT_STAPLE;

  const widget = (
    <div role="group" aria-labelledby={headingId} className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
      <h4 id={headingId} className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Capsare</h4>
      <div className="flex flex-wrap gap-1.5">
        {STAPLE_OPTIONS.map(({ key, label }) => {
          const isAllowed = allowed[key];
          const active = current[key];
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                if (!isAllowed) return;
                onChange({ ...current, [key]: !active });
              }}
              className={`flex-1 ${optionButtonClass({ active, disabled: !isAllowed && !active })}`}
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
