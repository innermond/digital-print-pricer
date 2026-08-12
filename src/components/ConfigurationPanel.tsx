import { useRef } from 'react';
import type { Elemental, SizeUnit, Media, Size, Product } from '../types';
import type { ProductConfig } from '../data/mockData';
import { MediaSelector } from './configuration/MediaSelector';
import { SizeSelector } from './configuration/SizeSelector';
import { CustomSizeControl } from './configuration/CustomSizeControl';
import { PrintingControl } from './configuration/PrintingControl';
import { PageCountControl } from './configuration/PageCountControl';
import { FinishingOptions } from './configuration/FinishingOptions';
import { Disclosure } from './Disclosure';
import { hasFinishingOptions } from '../lib/finishingRules';
import { advancedSummary } from '../lib/personalization';

type ConfigurationPanelProps = {
  element: Elemental;
  onUpdate: (updates: Partial<Elemental>) => void;
  customSizeUnit: SizeUnit;
  onCustomSizeUnitChange: (unit: SizeUnit) => void;
  config: ProductConfig;
  media: Media[];
  sizes: Size[];
  // The pristine catalog version of this product, used to work out which
  // advanced settings have been changed.
  baseline?: Product;
  // Rendered inside the advanced section: product-wide settings (spiral
  // binding, folder pocket) that used to sit in tabs of their own.
  productExtras?: React.ReactNode;
};

export function ConfigurationPanel({
  element,
  onUpdate,
  customSizeUnit,
  onCustomSizeUnitChange,
  config,
  media,
  sizes,
  baseline,
  productExtras,
}: ConfigurationPanelProps) {
  const advancedRef = useRef<HTMLDivElement>(null);
  const availableMedia = media.filter((m) => config.allowedMediaIds.includes(m.id));
  const availableSizes = sizes.filter((s) => config.allowedSizeIds.includes(s.id));

  const pageCountConstraint = config.elementalPageCounts?.[element.id];
  const showPageCount = pageCountConstraint?.kind === 'multiple';

  const baseElement = baseline?.elementals.find((e) => e.id === element.id);
  const chips = advancedSummary(element, baseElement);

  return (
    <div className="space-y-5">
      {/* Essentials: what every job needs, always visible. */}
      <section>
        <MediaSelector
          media={availableMedia}
          selectedId={element.media.id}
          recommendedId={config.recommendedMediaId}
          onSelect={(media) => onUpdate({ media })}
        />
      </section>
      <section>
        <SizeSelector
          sizes={availableSizes}
          currentSize={element.size}
          customSizeUnit={customSizeUnit}
          recommendedSizeId={config.recommendedSizeId}
          onSizeChange={(size) => onUpdate({ size })}
          onRequestCustomSize={() =>
            advancedRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }
        />
      </section>
      {showPageCount && (
        <section>
          <PageCountControl
            pageCount={element.pageCount}
            constraint={pageCountConstraint}
            onChange={(pageCount) => onUpdate({ pageCount })}
          />
        </section>
      )}
      <section>
        <PrintingControl
          printing={element.printing}
          onChange={(printing) => onUpdate({ printing })}
          allowedFronts={config.elementalPrintingFronts?.[element.id] ?? config.allowedPrintingFronts}
          allowedBacks={config.elementalPrintingBacks?.[element.id] ?? config.allowedPrintingBacks}
        />
      </section>

      {/* Advanced: exact dimensions, finishing, and product-wide accessories.
          Collapsed by default so a simple job is ~14 controls instead of ~45,
          but auto-opened (and chip-summarised) whenever something differs from
          the catalog default. */}
      <div ref={advancedRef}>
        <Disclosure label="Opțiuni avansate" chips={chips} resetKey={element.id}>
          <div className="space-y-5 pt-2">
            <CustomSizeControl
              currentSize={element.size}
              customSizeUnit={customSizeUnit}
              onSizeChange={(size) => onUpdate({ size })}
              onUnitChange={onCustomSizeUnitChange}
            />
            {hasFinishingOptions(element, config) && (
              <FinishingOptions element={element} config={config} onUpdate={onUpdate} />
            )}
            {productExtras}
          </div>
        </Disclosure>
      </div>
    </div>
  );
}
