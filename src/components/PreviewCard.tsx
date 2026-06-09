import type { Elemental, LaminationType, LaminationSides, RoundedCorner } from '../types';
import { Badge } from './Badge';

const CORNER_CLASSES: Record<RoundedCorner, string> = {
  1: 'rounded-tl-xl',
  2: 'rounded-tr-xl',
  3: 'rounded-bl-xl',
  4: 'rounded-br-xl',
};

const LAMINATION_BACKGROUNDS: Record<LaminationType, string> = {
  none: 'bg-white dark:bg-slate-700',
  gloss: 'bg-gradient-to-br from-white to-slate-100 dark:from-slate-600 dark:to-slate-700',
  matt: 'bg-slate-50 dark:bg-slate-700',
  'soft-touch': 'bg-slate-100 dark:bg-slate-600',
};

const LAMINATION_SIDE_LABELS: Record<LaminationSides, string> = {
  front: 'the front side',
  back: 'the back side',
  both: 'both sides',
};

type PreviewCardProps = {
  element: Elemental | undefined;
};

// ============ PREVIEW CARD ============
export function PreviewCard({ element }: PreviewCardProps) {
  if (!element) return null;

  const roundCornerClass = element.finishing.roundedCornes.corners
    .map((corner) => CORNER_CLASSES[corner])
    .join(' ');
  const { lamination } = element.finishing;
  const laminationColor = LAMINATION_BACKGROUNDS[lamination.type];

  const previewBox = (
    <div
      className={`flex flex-col items-center justify-center ${laminationColor} border-2 border-dashed border-slate-300 dark:border-slate-500 p-6 max-w-full max-h-48 ${roundCornerClass}`}
      style={{ aspectRatio: `${element.size.width} / ${element.size.height}` }}
    >
      <div className="text-center">
        <div className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          {element.label}
        </div>
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-50">
          {element.size.width.toFixed(1)} × {element.size.height.toFixed(1)} {element.size.unit}
        </div>
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          {element.media.kind === 'paper'
            ? `${element.media.gsm} GSM · ${element.media.finish}`
            : `${element.media.face} label`}
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm h-fit">
      <h3 className="mb-2.5 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Preview
      </h3>
      <div className="flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
        {lamination.type === 'none' ? (
          previewBox
        ) : (
          <Badge
            label={lamination.type.charAt(0).toUpperCase() + lamination.type.slice(1)}
            text={`${lamination.type} lamination on ${LAMINATION_SIDE_LABELS[lamination.sides]}`}
          >
            {previewBox}
          </Badge>
        )}
      </div>
    </div>
  );
}
