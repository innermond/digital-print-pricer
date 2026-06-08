import type { Elemental, Size, SizeUnit, LaminationType, LaminationSides, FoldingType } from '../types';
import { MOCK_PAPERS, MOCK_SIZES } from '../data/mockData';
import type { ProductConfig } from '../data/mockData';
import { convertSize } from '../lib/sizeUtils';
import {
  allowedLaminationTypes,
  allowedCreasingTypes,
  allowedRoundedCorners,
} from '../lib/finishingRules';

const SIZE_UNITS: SizeUnit[] = ['mm', 'in', 'pt'];
const LAMINATION_TYPES: LaminationType[] = ['none', 'gloss', 'matt', 'soft-touch'];
const LAMINATION_SIDES: LaminationSides[] = ['front', 'back', 'both'];
const FOLDING_TYPES: FoldingType[] = ['none', 'half-fold', 'tri-fold', 'z-fold', 'gate-fold'];
const ROUNDED_CORNER_COUNTS = [0, 1, 2, 3, 4] as const;

type ConfigurationPanelProps = {
  element: Elemental;
  onUpdate: (updates: Partial<Elemental>) => void;
  customSizeUnit: SizeUnit;
  onCustomSizeUnitChange: (unit: SizeUnit) => void;
  config: ProductConfig;
};

// ============ CONFIGURATION PANEL ============
export function ConfigurationPanel({ element, onUpdate, customSizeUnit, onCustomSizeUnitChange, config }: ConfigurationPanelProps) {
  // Filter papers based on product config
  const availablePapers = MOCK_PAPERS.filter(p =>
    config.allowedPaperIds.includes(p.id)
  );

  // Filter sizes based on product config
  const availableSizes = MOCK_SIZES.filter(s =>
    config.allowedSizeIds.includes(s.id)
  );

  // Find which size preset matches current element size
  const matchingPreset = availableSizes.find(
    (size) =>
      convertSize(size.width, size.unit, 'mm') ===
        convertSize(element.size.width, element.size.unit, 'mm') &&
      convertSize(size.height, size.unit, 'mm') ===
        convertSize(element.size.height, element.size.unit, 'mm')
  );

  const isCustomSize = !matchingPreset;
  const displayWidth = convertSize(element.size.width, element.size.unit, customSizeUnit);
  const displayHeight = convertSize(element.size.height, element.size.unit, customSizeUnit);

  const handlePresetSelect = (size: Size) => {
    const newWidth = convertSize(size.width, size.unit, customSizeUnit);
    const newHeight = convertSize(size.height, size.unit, customSizeUnit);
    onUpdate({
      size: {
        id: size.id,
        label: size.label,
        width: newWidth,
        height: newHeight,
        unit: customSizeUnit,
      },
    });
  };

  const handleCustomSizeChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdate({
      size: {
        id: 'custom',
        label: 'Custom',
        width: field === 'width' ? numValue : displayWidth,
        height: field === 'height' ? numValue : displayHeight,
        unit: customSizeUnit,
      },
    });
  };

  const handleUnitChange = (newUnit: SizeUnit) => {
    onCustomSizeUnitChange(newUnit);
    const convertedWidth = convertSize(element.size.width, element.size.unit, newUnit);
    const convertedHeight = convertSize(element.size.height, element.size.unit, newUnit);
    onUpdate({
      size: {
        ...element.size,
        width: convertedWidth,
        height: convertedHeight,
        unit: newUnit,
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Paper Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-900 dark:text-slate-50 mb-2">
          Paper
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availablePapers.map((paper) => (
            <button
              key={paper.id}
              onClick={() => onUpdate({ paper })}
              className={`rounded-lg border-2 px-2.5 py-2 text-left transition text-xs relative ${
                element.paper.id === paper.id
                  ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {config.recommendedPaperId === paper.id && (
                <span className="absolute top-1 right-1 bg-amber-500 text-white text-xs rounded px-1.5 py-0.5 font-medium">
                  ⭐
                </span>
              )}
              <div className="font-medium text-slate-900 dark:text-slate-50">{paper.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {paper.gsm} GSM
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-2 gap-2">
          <label className="block text-xs font-semibold text-slate-900 dark:text-slate-50">
            Size
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

        {/* Size Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {availableSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => handlePresetSelect(size)}
              className={`rounded-lg border-2 px-2.5 py-2 text-left transition text-xs relative ${
                matchingPreset?.id === size.id
                  ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {config.recommendedSizeId === size.id && (
                <span className="absolute top-1 right-1 bg-amber-500 text-white text-xs rounded px-1.5 py-0.5 font-medium">
                  ⭐
                </span>
              )}
              <div className="font-medium text-slate-900 dark:text-slate-50">{size.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {convertSize(size.width, size.unit, customSizeUnit).toFixed(1)} × {convertSize(size.height, size.unit, customSizeUnit).toFixed(1)} {customSizeUnit}
              </div>
            </button>
          ))}

          {/* Custom Size Preset Button */}
          <button
            onClick={() => {}}
            className={`rounded-lg border-2 px-2.5 py-2 text-left transition text-xs ${
              isCustomSize
                ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950'
                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
            }`}
          >
            <div className="font-medium text-slate-900 dark:text-slate-50">Custom</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {displayWidth.toFixed(1)} × {displayHeight.toFixed(1)} {customSizeUnit}
            </div>
          </button>
        </div>

        {/* Custom Size Inputs */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Width ({customSizeUnit})
            </label>
            <input
              type="number"
              value={displayWidth.toFixed(2)}
              onChange={(e) => handleCustomSizeChange('width', e.target.value)}
              className="w-full rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-600 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:focus:border-blue-600 dark:focus:ring-blue-600"
              placeholder="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Height ({customSizeUnit})
            </label>
            <input
              type="number"
              value={displayHeight.toFixed(2)}
              onChange={(e) => handleCustomSizeChange('height', e.target.value)}
              className="w-full rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-600 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:focus:border-blue-600 dark:focus:ring-blue-600"
              placeholder="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Finishing Options */}
      <div>
        <label className="block text-xs font-semibold text-slate-900 dark:text-slate-50 mb-2">
          Finishing
        </label>
        <div className="space-y-2.5">
          {/* Lamination */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
            <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Lamination</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
              {LAMINATION_TYPES.map((type) => {
                const allowed = allowedLaminationTypes(element);
                return (
                <button
                  key={type}
                  onClick={() => {
                    if (!allowed) return;
                    onUpdate({
                      finishing: {
                        ...element.finishing,
                        lamination: {
                          ...element.finishing.lamination,
                          type,
                        },
                      },
                    });
                  }}
                    className={`rounded px-2 py-1.5 text-xs font-medium transition ${
                      !allowed &&  element.finishing.lamination.type !== type
                        ? 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        :  element.finishing.lamination.type === type
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )})}
            </div>
            {element.finishing.lamination.type !== 'none' && (
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  Apply to:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {LAMINATION_SIDES.map((side) => (
                    <button
                      key={side}
                      onClick={() =>
                        onUpdate({
                          finishing: {
                            ...element.finishing,
                            lamination: {
                              ...element.finishing.lamination,
                              sides: side,
                            },
                          },
                        })
                      }
                      className={`rounded px-2 py-1 text-xs font-medium transition ${
                        element.finishing.lamination.sides === side
                          ? 'bg-blue-500 dark:bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500'
                      }`}
                    >
                      {side.charAt(0).toUpperCase() + side.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Folding */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
            <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Folding</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {FOLDING_TYPES.map((type) => {
                const allowed = config.allowedFoldTypes.includes(type);
                return (
                  <button
                    key={type}
                    disabled={!allowed}
                    onClick={() => {
                      if (!allowed) return;
                      onUpdate({
                        finishing: {
                          ...element.finishing,
                          folding: {
                            type,
                            folds: type === 'none' ? 0 : element.finishing.folding.folds || 1,
                          },
                        },
                      });
                    }}
                    className={`rounded px-2 py-1.5 text-xs font-medium transition ${
                      !allowed &&  element.finishing.folding.type !== type
                        ? 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : element.finishing.folding.type === type
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400'
                    }`}
                  >
                    {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Creasing */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
            <label className="flex items-center justify-between gap-2 text-xs font-medium text-slate-900 dark:text-slate-50 mb-2">
              Creasing
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="5"
                value={element.finishing.creasing.count}
                onChange={(e) => {
                  if (! allowedCreasingTypes(element)) return;
                  onUpdate({
                    finishing: {
                      ...element.finishing,
                      creasing: { count: parseInt(e.target.value) },
                    },
                  });
                }}
                className={'flex-1 ' + (allowedCreasingTypes(element) ? 'accent-blue-500 dark:accent-blue-400' : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed')}
              />
              <span className="text-xs font-medium text-slate-900 dark:text-slate-50 w-6 text-center">
                {element.finishing.creasing.count}
              </span>
            </div>
          </div>

          {/* Rounded Corners */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
            <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Rounded Corners</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {ROUNDED_CORNER_COUNTS.map((count) => {
                const allowed = allowedRoundedCorners(element);
                const isActive = allowed && element.finishing.roundedCornes.count === count;
                const base = 'rounded px-2 py-1.5 text-xs font-medium transition border';
                const active = 'bg-blue-500 dark:bg-blue-600 text-white';
                const inactive =
                  'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400';
                const disabled = !allowed ? 'cursor-not-allowed' : '';

                return (
                  <button
                    key={count}
                    onClick={() => {
                      if (!allowed) return;
                      onUpdate({
                        finishing: {
                          ...element.finishing,
                          roundedCornes: { count },
                        },
                      });
                    }}
                    className={`${base} ${isActive ? active : inactive} ${disabled}`}
                  >
                    {count}
                  </button>
              )})}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
