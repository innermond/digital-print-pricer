import { useId } from 'react';
import type { Size, SizeUnit } from '../../types';
import { convertSize } from '../../lib/sizeUtils';
import { Badge } from '../Badge';
import { optionCardClass } from '../../lib/optionButton';

type SizeSelectorProps = {
  sizes: Size[];
  currentSize: Size;
  customSizeUnit: SizeUnit;
  recommendedSizeId: string;
  onSizeChange: (size: Size) => void;
  // Reveals the exact-dimensions control, which lives in the advanced section.
  onRequestCustomSize?: () => void;
  badgeText?: string;
};

export function SizeSelector({
  sizes,
  currentSize,
  customSizeUnit,
  recommendedSizeId,
  onSizeChange,
  onRequestCustomSize,
  badgeText,
}: SizeSelectorProps) {
  const headingId = useId();

  const matchingPreset = sizes.find(
    (s) => s.widthMm === currentSize.widthMm && s.heightMm === currentSize.heightMm
  );

  const isCustomSize = !matchingPreset;
  const displayWidth = convertSize(currentSize.widthMm, 'mm', customSizeUnit);
  const displayHeight = convertSize(currentSize.heightMm, 'mm', customSizeUnit);

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
      <h3 id={headingId} className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
        Dimensiune
      </h3>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size.id}
            type="button"
            onClick={() => handlePresetSelect(size)}
            aria-pressed={matchingPreset?.id === size.id}
            className={`flex-1 min-w-28 relative ${optionCardClass({ active: matchingPreset?.id === size.id })}`}
          >
            {recommendedSizeId === size.id && (
              <span
                className="absolute top-1 right-1 text-xs rounded px-1.5 py-0.5 font-medium"
                title="Recomandat"
              >
                ⭐
              </span>
            )}
            <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{size.label}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {convertSize(size.width, size.unit, customSizeUnit).toFixed(1)} ×{' '}
              {convertSize(size.height, size.unit, customSizeUnit).toFixed(1)} {customSizeUnit}
            </div>
          </button>
        ))}

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
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
