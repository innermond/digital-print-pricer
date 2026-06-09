import type { Elemental, SizeUnit } from '../types';
import { MOCK_PAPERS, MOCK_SIZES } from '../data/mockData';
import type { ProductConfig } from '../data/mockData';
import { PaperSelector } from './configuration/PaperSelector';
import { SizeSelector } from './configuration/SizeSelector';
import { FinishingOptions } from './configuration/FinishingOptions';

type ConfigurationPanelProps = {
  element: Elemental;
  onUpdate: (updates: Partial<Elemental>) => void;
  customSizeUnit: SizeUnit;
  onCustomSizeUnitChange: (unit: SizeUnit) => void;
  config: ProductConfig;
};

export function ConfigurationPanel({ element, onUpdate, customSizeUnit, onCustomSizeUnitChange, config }: ConfigurationPanelProps) {
  const availablePapers = MOCK_PAPERS.filter((p) => config.allowedPaperIds.includes(p.id));
  const availableSizes = MOCK_SIZES.filter((s) => config.allowedSizeIds.includes(s.id));

  return (
    <div className="space-y-3">
      <PaperSelector
        papers={availablePapers}
        selectedId={element.paper.id}
        recommendedId={config.recommendedPaperId}
        onSelect={(paper) => onUpdate({ paper })}
      />
      <SizeSelector
        sizes={availableSizes}
        currentSize={element.size}
        customSizeUnit={customSizeUnit}
        recommendedSizeId={config.recommendedSizeId}
        onSizeChange={(size) => onUpdate({ size })}
        onUnitChange={onCustomSizeUnitChange}
      />
      <FinishingOptions
        element={element}
        config={config}
        onUpdate={onUpdate}
      />
    </div>
  );
}
