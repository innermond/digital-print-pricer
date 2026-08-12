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

  return (
    <div role="group" aria-labelledby={headingId} className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
      <h4 id={headingId} className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Spirală</h4>
      <div className="flex flex-wrap gap-1.5">
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
