import { NumericButton } from '../NumericButton';

type MultipleConstraint = { of: number; min: number; max: number };

type PageCountControlProps = {
  pageCount: number;
  constraint: MultipleConstraint;
  onChange: (pageCount: number) => void;
};

export function PageCountControl({ pageCount, constraint, onChange }: PageCountControlProps) {
  const { of: step, min, max } = constraint;

  const snap = (n: number) => {
    const rounded = Math.round(n / step) * step;
    return Math.max(min, Math.min(max, rounded));
  };

  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-900 dark:text-slate-50">
          Pagini
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          multipli de {step}, {min}–{max}
        </span>
      </div>
      <div className="mt-2">
        <NumericButton
          value={pageCount}
          onClickPlus={() => onChange(snap(pageCount + step))}
          onClickMinus={() => onChange(snap(pageCount - step))}
          onChange={(e) => {
            const n = parseInt(e.target.value);
            if (!isNaN(n)) onChange(snap(n));
          }}
          style="w-full"
        />
      </div>
    </div>
  );
}
