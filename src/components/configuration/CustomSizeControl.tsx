import { useId, type Ref } from 'react';
import type { Size, SizeUnit } from '../../types';
import { convertSize, resolveSize } from '../../lib/sizeUtils';
import { NumericButton } from '../NumericButton';
import { optionButtonClass } from '../../lib/optionButton';

const SIZE_UNITS: SizeUnit[] = ['mm', 'in', 'pt'];

type CustomSizeControlProps = {
  currentSize: Size;
  // The whole catalog's sizes, so typed dimensions can be recognised as the
  // format they are — the full list, not the product's allowed subset: a
  // 297×210 sheet is an A4 whether or not this product offers A4.
  presets: Size[];
  customSizeUnit: SizeUnit;
  onSizeChange: (size: Size) => void;
  onUnitChange: (unit: SizeUnit) => void;
  // The printing machine's ceiling, in mm. Omit for no ceiling.
  maxWidthMm?: number;
  maxHeightMm?: number;
  // Lets a caller (the "Personalizat" button) move focus into this field.
  widthInputRef?: Ref<HTMLInputElement>;
};

// Exact width/height plus the display unit. Split out of SizeSelector: the
// presets cover almost every job, so the free-form dimensions belong with the
// other advanced settings rather than under every size picker.
export function CustomSizeControl({
  currentSize,
  presets,
  customSizeUnit,
  onSizeChange,
  onUnitChange,
  maxWidthMm,
  maxHeightMm,
  widthInputRef,
}: CustomSizeControlProps) {
  const widthId = useId();
  const heightId = useId();
  const step = customSizeUnit === 'in' ? 0.1 : 1;
  const precision = customSizeUnit === 'in' ? 1 : 0;
  const fmt = (n: number) => n.toFixed(precision);

  const displayWidth = convertSize(currentSize.widthMm, 'mm', customSizeUnit);
  const displayHeight = convertSize(currentSize.heightMm, 'mm', customSizeUnit);
  // Never above the machine ceiling, in the field's own display unit.
  const maxDisplayWidth = maxWidthMm !== undefined ? convertSize(maxWidthMm, 'mm', customSizeUnit) : undefined;
  const maxDisplayHeight = maxHeightMm !== undefined ? convertSize(maxHeightMm, 'mm', customSizeUnit) : undefined;

  const handleCustomSizeChange = (field: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value) || 0;
    const max = field === 'width' ? maxDisplayWidth : maxDisplayHeight;
    const clampedValue = max !== undefined ? Math.min(numValue, max) : numValue;
    const numMm = convertSize(clampedValue, customSizeUnit, 'mm');
    // Resolved rather than hardcoded to 'custom': typing 297 next to a height
    // of 210 lands back on A4, turned sideways, instead of losing the name.
    onSizeChange(
      resolveSize(
        presets,
        field === 'width' ? numMm : currentSize.widthMm,
        field === 'height' ? numMm : currentSize.heightMm,
        customSizeUnit
      )
    );
  };

  const handleUnitChange = (newUnit: SizeUnit) => {
    onUnitChange(newUnit);
    onSizeChange({
      ...currentSize,
      width: convertSize(currentSize.widthMm, 'mm', newUnit),
      height: convertSize(currentSize.heightMm, 'mm', newUnit),
      unit: newUnit,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Dimensiuni exacte
        </h4>
        <div className="flex gap-1" role="group" aria-label="Unitate de măsură">
          {SIZE_UNITS.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => handleUnitChange(unit)}
              aria-pressed={customSizeUnit === unit}
              className={optionButtonClass({ active: customSizeUnit === unit })}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700">
        <div className="flex-1 min-w-24">
          <label htmlFor={widthId} className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Lățime ({customSizeUnit})
            {maxDisplayWidth !== undefined && (
              <span className="text-amber-700 dark:text-amber-300"> · max {fmt(maxDisplayWidth)}</span>
            )}
          </label>
          <NumericButton
            ref={widthInputRef}
            id={widthId}
            value={fmt(displayWidth)}
            onChange={(e) => handleCustomSizeChange('width', e.target.value)}
            onClickPlus={() => handleCustomSizeChange('width', fmt(displayWidth + step))}
            onClickMinus={() => handleCustomSizeChange('width', fmt(Math.max(0, displayWidth - step)))}
            style="w-full"
          />
        </div>
        <div className="flex-1 min-w-24">
          <label htmlFor={heightId} className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Înălțime ({customSizeUnit})
            {maxDisplayHeight !== undefined && (
              <span className="text-amber-700 dark:text-amber-300"> · max {fmt(maxDisplayHeight)}</span>
            )}
          </label>
          <NumericButton
            id={heightId}
            value={fmt(displayHeight)}
            onChange={(e) => handleCustomSizeChange('height', e.target.value)}
            onClickPlus={() => handleCustomSizeChange('height', fmt(displayHeight + step))}
            onClickMinus={() => handleCustomSizeChange('height', fmt(Math.max(0, displayHeight - step)))}
            style="w-full"
          />
        </div>
      </div>
    </div>
  );
}
