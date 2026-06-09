import type { Size, SizeUnit } from '../../types';
import { convertSize } from '../../lib/sizeUtils';
import { NumericButton } from '../NumericButton';
import { Badge } from '../Badge';

const SIZE_UNITS: SizeUnit[] = ['mm', 'in', 'pt'];

type SizeSelectorProps = {
  sizes: Size[];
  currentSize: Size;
  customSizeUnit: SizeUnit;
  recommendedSizeId: string;
  onSizeChange: (size: Size) => void;
  onUnitChange: (unit: SizeUnit) => void;
  badgeText?: string;
};

export function SizeSelector({
  sizes,
  currentSize,
  customSizeUnit,
  recommendedSizeId,
  onSizeChange,
  onUnitChange,
  badgeText,
}: SizeSelectorProps) {
  const step = customSizeUnit === 'in' ? 0.1 : 1;
  const precision = customSizeUnit === 'in' ? 1 : 0;
  const fmt = (n: number) => n.toFixed(precision);

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

  const widget = (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2">
        <label className="block text-xs font-semibold text-slate-900 dark:text-slate-50">
          Dimensiune
        </label>
        <div className="flex gap-1">
          {SIZE_UNITS.map((unit) => (
            <button
              key={unit}
              onClick={() => handleUnitChange(unit)}
              className={`rounded px-2 py-1 text-xs font-medium transition ${
                customSizeUnit === unit
                  ? 'bg-blue-500 dark:bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {sizes.map((size) => (
          <button
            key={size.id}
            onClick={() => handlePresetSelect(size)}
            className={`flex-1 min-w-28 rounded-lg border-2 px-2.5 py-2 text-left transition text-xs relative ${
              matchingPreset?.id === size.id
                ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950'
                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
            }`}
          >
            {recommendedSizeId === size.id && (
              <span className="absolute top-1 right-1 bg-amber-500 text-white text-xs rounded px-1.5 py-0.5 font-medium">
                ⭐
              </span>
            )}
            <div className="font-medium text-slate-900 dark:text-slate-50">{size.label}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {convertSize(size.width, size.unit, customSizeUnit).toFixed(1)} ×{' '}
              {convertSize(size.height, size.unit, customSizeUnit).toFixed(1)} {customSizeUnit}
            </div>
          </button>
        ))}

        <button
          onClick={() => {}}
          className={`flex-1 min-w-28 rounded-lg border-2 px-2.5 py-2 text-left transition text-xs ${
            isCustomSize
              ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950'
              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
          }`}
        >
          <div className="font-medium text-slate-900 dark:text-slate-50">Personalizat</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {displayWidth.toFixed(1)} × {displayHeight.toFixed(1)} {customSizeUnit}
          </div>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700">
        <div className="flex-1 min-w-24">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Lățime ({customSizeUnit})
          </label>
          <NumericButton
            value={fmt(displayWidth)}
            onChange={(e) => handleCustomSizeChange('width', e.target.value)}
            onClickPlus={() => handleCustomSizeChange('width', fmt(displayWidth + step))}
            onClickMinus={() => handleCustomSizeChange('width', fmt(Math.max(0, displayWidth - step)))}
            style="w-full"
          />
        </div>
        <div className="flex-1 min-w-24">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Înălțime ({customSizeUnit})
          </label>
          <NumericButton
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

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
