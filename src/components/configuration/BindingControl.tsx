import type { Binding, SpiralColor } from '../../types';

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
  const selectedColor = binding?.type === 'spiral' ? binding.color : undefined;

  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Spirală</h4>
      <div className="flex flex-wrap gap-1.5">
        {SPIRAL_COLORS.map((color) => {
          const allowed = allowedColors.includes(color);
          const { label } = SPIRAL_COLOR_INFO[color];
          return (
            <button
              key={color}
              onClick={() => {
                if (!allowed) return;
                onChange({ type: 'spiral', color });
              }}
              className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
                !allowed && selectedColor !== color
                  ? 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : selectedColor === color
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
}
