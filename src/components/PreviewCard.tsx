import type { Binding, Elemental, Pocket, Size } from '../types';
import { Badge } from './Badge';
import { ProductPreview } from './ProductPreview';
import { previewShapes } from '../lib/previewGeometry';
import { LAMINATION_RO, LAMINATION_SIDES_RO } from '../lib/labels';
import { matchSizePreset, sizePresetLabel } from '../lib/sizeUtils';

type PreviewCardProps = {
  element: Elemental | undefined;
  // Product-level features. They belong to the whole job rather than to this
  // element, but they are what the customer sees, so they are drawn on it.
  binding?: Binding;
  pocket?: Pocket;
  punchHole?: boolean;
  // Whether the element is one panel of a sheet folded in half — a Mapă's A4
  // cover is half an A3 — so the drawing opens it out.
  foldedInHalf?: boolean;
  // Named formats, so the caption can say "A4 orizontal" the way the size
  // picker does. Omit and the caption gives dimensions alone.
  presets?: Size[];
};

/** `A4 orizontal · 297.0 × 210.0 mm`, or just the dimensions for a custom size. */
const sizeCaption = (size: Size, presets: Size[]) => {
  const dimensions = `${size.width.toFixed(1)} × ${size.height.toFixed(1)} ${size.unit}`;
  const match = matchSizePreset(presets, size.widthMm, size.heightMm);
  return match ? `${sizePresetLabel(match)} · ${dimensions}` : dimensions;
};

// ============ PREVIEW CARD ============
export function PreviewCard({ element, binding, pocket, punchHole, foldedInHalf, presets = [] }: PreviewCardProps) {
  if (!element) return null;

  const { lamination } = element.finishing;
  const shapes = previewShapes({ element, binding, pocket, punchHole, foldedInHalf });
  const caption = sizeCaption(element.size, presets);

  const previewBox = (
    <ProductPreview
      shapes={shapes}
      lamination={lamination.type}
      title={`${element.label}, ${caption}`}
    />
  );

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm h-fit">
      <h3 className="mb-2.5 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Previzualizare
      </h3>
      <div className="flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
        {lamination.type === 'none' ? (
          previewBox
        ) : (
          <Badge
            label={LAMINATION_RO[lamination.type] ?? lamination.type}
            text={`Laminare ${(LAMINATION_RO[lamination.type] ?? lamination.type).toLowerCase()} pe ${
              LAMINATION_SIDES_RO[lamination.sides] ?? lamination.sides
            }`}
          >
            {previewBox}
          </Badge>
        )}
      </div>
      <div className="mt-2.5 text-center">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          {element.label}
        </div>
        <div className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-50">{caption}</div>
        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          {/* Tested against 'sticker', not 'paper': a special has no `face`, so the
              other way round captioned every special "Etichetă undefined". */}
          {element.media.kind === 'sticker'
            ? `Etichetă ${element.media.face}`
            : `${element.media.gsm} GSM · ${element.media.finish}`}
        </div>
      </div>
    </div>
  );
}
