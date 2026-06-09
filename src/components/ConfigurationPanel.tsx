import type { Elemental, SizeUnit } from '../types';
import { MOCK_MEDIA, MOCK_SIZES } from '../data/mockData';
import type { ProductConfig } from '../data/mockData';
import { MediaSelector } from './configuration/MediaSelector';
import { SizeSelector } from './configuration/SizeSelector';
import { PrintingControl } from './configuration/PrintingControl';
import { PageCountControl } from './configuration/PageCountControl';
import { FinishingOptions } from './configuration/FinishingOptions';

type ConfigurationPanelProps = {
  element: Elemental;
  onUpdate: (updates: Partial<Elemental>) => void;
  customSizeUnit: SizeUnit;
  onCustomSizeUnitChange: (unit: SizeUnit) => void;
  config: ProductConfig;
};

export function ConfigurationPanel({ element, onUpdate, customSizeUnit, onCustomSizeUnitChange, config }: ConfigurationPanelProps) {
  const availableMedia = MOCK_MEDIA.filter((m) => config.allowedMediaIds.includes(m.id));
  const availableSizes = MOCK_SIZES.filter((s) => config.allowedSizeIds.includes(s.id));

  const pageCountConstraint = config.elementalPageCounts?.[element.id];
  const showPageCount = pageCountConstraint?.kind === 'multiple';

  return (
    <div className="space-y-3">
      <MediaSelector
        media={availableMedia}
        selectedId={element.media.id}
        recommendedId={config.recommendedMediaId}
        onSelect={(media) => onUpdate({ media })}
      />
      <SizeSelector
        sizes={availableSizes}
        currentSize={element.size}
        customSizeUnit={customSizeUnit}
        recommendedSizeId={config.recommendedSizeId}
        onSizeChange={(size) => onUpdate({ size })}
        onUnitChange={onCustomSizeUnitChange}
      />
      {showPageCount && (
        <PageCountControl
          pageCount={element.pageCount}
          constraint={pageCountConstraint}
          onChange={(pageCount) => onUpdate({ pageCount })}
        />
      )}
      <PrintingControl
        printing={element.printing}
        onChange={(printing) => onUpdate({ printing })}
        allowedBacks={config.allowedPrintingBacks}
      />
      <FinishingOptions
        element={element}
        config={config}
        onUpdate={onUpdate}
      />
    </div>
  );
}
