import type { Elemental, LaminationType } from '../types';

const ROUND_CORNER_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'rounded-none',
  1: 'rounded-sm',
  2: 'rounded-md',
  3: 'rounded-lg',
  4: 'rounded-full',
};

const LAMINATION_BACKGROUNDS: Record<LaminationType, string> = {
  none: 'bg-white dark:bg-slate-700',
  gloss: 'bg-gradient-to-br from-white to-slate-100 dark:from-slate-600 dark:to-slate-700',
  matt: 'bg-slate-50 dark:bg-slate-700',
  'soft-touch': 'bg-slate-100 dark:bg-slate-600',
};

type PreviewCardProps = {
  element: Elemental | undefined;
};

// ============ PREVIEW CARD ============
export function PreviewCard({ element }: PreviewCardProps) {
  if (!element) return null;

  const roundCornerClass = ROUND_CORNER_CLASSES[element.finishing.roundedCornes.count];
  const laminationColor = LAMINATION_BACKGROUNDS[element.finishing.lamination.type];

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm h-fit">
      <h3 className="mb-2.5 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Preview
      </h3>
      <div className="flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
        <div
          className={`flex flex-col items-center justify-center ${laminationColor} border-2 border-dashed border-slate-300 dark:border-slate-500 p-6 ${roundCornerClass}`}
          style={{
            aspectRatio: `${element.size.width} / ${element.size.height}`,
            maxWidth: '100%',
            width: '200px',
          }}
        >
          <div className="text-center">
            <div className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {element.label}
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-50">
              {element.size.width.toFixed(1)} × {element.size.height.toFixed(1)} {element.size.unit}
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              {element.paper.gsm} GSM • {element.paper.finish}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
