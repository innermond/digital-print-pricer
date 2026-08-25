import { useId } from 'react';
import type { Binding, SpiralColor } from '../../types';
import { optionButtonClass } from '../../lib/optionButton';

const SPIRAL_COLOR_INFO: Record<SpiralColor, { label: string }> = {
  white: { label: 'Alb' },
  black: { label: 'Negru' },
};

const SPIRAL_COLORS = Object.keys(SPIRAL_COLOR_INFO) as SpiralColor[];

type BindingControlProps = {
  binding: Binding | undefined;
  allowedColors: SpiralColor[];
  onChange: (binding: Binding) => void;
};

export function BindingControl({ binding, allowedColors, onChange }: BindingControlProps) {
  const headingId = useId();
  const selectedColor = binding?.type === 'spiral' ? binding.color : undefined;
  // No binding yet and an explicit `none` read the same: nothing is bound.
  const unbound = selectedColor === undefined;

  return (
    <div role="group" aria-labelledby={headingId} className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
      <h4 id={headingId} className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Spirală</h4>
      <div className="flex flex-wrap gap-1.5">
        {/* Without a way back, a mis-clicked colour was unrecoverable short of
            Resetare — and it went into the price. */}
        <button
          type="button"
          aria-pressed={unbound}
          onClick={() => onChange({ type: 'none' })}
          className={`flex-1 ${optionButtonClass({ active: unbound })}`}
        >
          Fără
        </button>
        {SPIRAL_COLORS.map((color) => {
          const allowed = allowedColors.includes(color);
          const { label } = SPIRAL_COLOR_INFO[color];
          return (
            <button
              key={color}
              type="button"
              aria-pressed={selectedColor === color}
              onClick={() => {
                if (!allowed) return;
                onChange({ type: 'spiral', color });
              }}
              className={`flex-1 ${optionButtonClass({
                active: selectedColor === color,
                disabled: !allowed && selectedColor !== color,
              })}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
