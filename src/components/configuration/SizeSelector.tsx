import { useId } from 'react';
import { RotateCw } from 'lucide-react';
import type { Size, SizeUnit } from '../../types';
import { convertSize, matchSizePreset, rotateSize, sizePresetLabel } from '../../lib/sizeUtils';
import { Badge } from '../Badge';
import { optionButtonClass, optionCardClass } from '../../lib/optionButton';

type SizeSelectorProps = {
  sizes: Size[];
  currentSize: Size;
  customSizeUnit: SizeUnit;
  recommendedSizeId: string;
  onSizeChange: (size: Size) => void;
  // Reveals the exact-dimensions control, which lives in the advanced section.
  onRequestCustomSize?: () => void;
  badgeText?: string;
  // True when at least one preset the product's config would otherwise offer
  // was left out of `sizes` for exceeding the printing machine's max — so a
  // missing preset reads as a press limit rather than a vanished option.
  machineLimitHidesSizes?: boolean;
  // The whole catalog's sizes, so a rotation lands on the format it is rather
  // than on a nameless custom size. Deliberately not used to name the card
  // itself: a preset missing from `sizes` was withheld on purpose (the press
  // can't take it), and naming it there would offer back what was withheld.
  // Defaults to the rendered list.
  presets?: Size[];
};

export function SizeSelector({
  sizes,
  currentSize,
  customSizeUnit,
  recommendedSizeId,
  onSizeChange,
  onRequestCustomSize,
  badgeText,
  machineLimitHidesSizes,
  presets,
}: SizeSelectorProps) {
  const headingId = useId();
  const allPresets = presets ?? sizes;

  // Orientation-aware now: a 297×210 sheet is an A4 lying down, and used to
  // fall through to "Personalizat". Matched against the rendered presets, since
  // this decides which card lights up.
  const shownMatch = matchSizePreset(sizes, currentSize.widthMm, currentSize.heightMm);

  const isCustomSize = !shownMatch;
  const displayWidth = convertSize(currentSize.widthMm, 'mm', customSizeUnit);
  const displayHeight = convertSize(currentSize.heightMm, 'mm', customSizeUnit);

  // Rotating a square is a no-op, so the control only appears where it means
  // something. There is no press check to make: the sheet keeps the same pair
  // of edges, so whatever fits one way round fits the other (see fitsMachine).
  const canRotate = currentSize.widthMm !== currentSize.heightMm;
  const rotated = rotateSize(allPresets, currentSize);

  const handlePresetSelect = (size: Size) => {
    onSizeChange({
      id: size.id,
      label: size.label,
      width: convertSize(size.widthMm, 'mm', customSizeUnit),
      height: convertSize(size.heightMm, 'mm', customSizeUnit),
      widthMm: size.widthMm,
      heightMm: size.heightMm,
      unit: customSizeUnit,
    });
  };

  const widget = (
    <div role="group" aria-labelledby={headingId}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 id={headingId} className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
          Dimensiune
        </h3>
        {canRotate && (
          <button
            type="button"
            onClick={() => onSizeChange(rotated)}
            aria-label="Rotește dimensiunea"
            title="Rotește dimensiunea"
            className={`flex items-center gap-1 ${optionButtonClass({ active: false })}`}
          >
            <RotateCw size={14} />
            Rotește
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const active = shownMatch?.preset.id === size.id;
          // The highlighted card must describe the sheet it stands for, not the
          // catalogued orientation it was stored in.
          const turned = active && shownMatch.rotated;
          const label = turned ? sizePresetLabel(shownMatch) : size.label;
          const widthMm = turned ? currentSize.widthMm : size.widthMm;
          const heightMm = turned ? currentSize.heightMm : size.heightMm;

          return (
            <button
              key={size.id}
              type="button"
              onClick={() => handlePresetSelect(size)}
              aria-pressed={active}
              className={`flex-1 min-w-28 relative ${optionCardClass({ active })}`}
            >
              {recommendedSizeId === size.id && (
                <span
                  className="absolute top-1 right-1 text-xs rounded px-1.5 py-0.5 font-medium"
                  title="Recomandat"
                >
                  ⭐
                </span>
              )}
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {convertSize(widthMm, 'mm', customSizeUnit).toFixed(1)} ×{' '}
                {convertSize(heightMm, 'mm', customSizeUnit).toFixed(1)} {customSizeUnit}
              </div>
            </button>
          );
        })}

        {/* Opens the exact-dimensions control rather than being a dead
            indicator, which is all it used to be. */}
        <button
          type="button"
          onClick={onRequestCustomSize}
          aria-pressed={isCustomSize}
          className={`flex-1 min-w-28 ${optionCardClass({ active: isCustomSize })}`}
        >
          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Personalizat</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {displayWidth.toFixed(1)} × {displayHeight.toFixed(1)} {customSizeUnit}
          </div>
        </button>
      </div>

      {machineLimitHidesSizes && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Unele dimensiuni presetate depășesc limita presei și nu sunt afișate.
        </p>
      )}
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
