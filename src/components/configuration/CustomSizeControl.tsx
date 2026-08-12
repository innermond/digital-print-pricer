import { useId } from 'react';
import type { Size, SizeUnit } from '../../types';
import { convertSize } from '../../lib/sizeUtils';
import { NumericButton } from '../NumericButton';
import { optionButtonClass } from '../../lib/optionButton';

const SIZE_UNITS: SizeUnit[] = ['mm', 'in', 'pt'];

type CustomSizeControlProps = {
  currentSize: Size;
  customSizeUnit: SizeUnit;
  onSizeChange: (size: Size) => void;
  onUnitChange: (unit: SizeUnit) => void;
};

// Exact width/height plus the display unit. Split out of SizeSelector: the
// presets cover almost every job, so the free-form dimensions belong with the
// other advanced settings rather than under every size picker.
export function CustomSizeControl({
  currentSize,
  customSizeUnit,
  onSizeChange,
  onUnitChange,
}: CustomSizeControlProps) {
  const widthId = useId();
  const heightId = useId();
  const step = customSizeUnit === 'in' ? 0.1 : 1;
  const precision = customSizeUnit === 'in' ? 1 : 0;
  const fmt = (n: number) => n.toFixed(precision);

  const displayWidth = convertSize(currentSize.widthMm, 'mm', customSizeUnit);
  const displayHeight = convertSize(currentSize.heightMm, 'mm', customSizeUnit);

  const handleCustomSizeChange = (field: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value) || 0;
    const numMm = convertSize(numValue, customSizeUnit, 'mm');
    onSizeChange({
      id: 'custom',
      label: 'Personalizat',
      width: field === 'width' ? numValue : displayWidth,
      height: field === 'height' ? numValue : displayHeight,
      widthMm: field === 'width' ? numMm : currentSize.widthMm,
      heightMm: field === 'height' ? numMm : currentSize.heightMm,
      unit: customSizeUnit,
    });
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
          </label>
          <NumericButton
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
