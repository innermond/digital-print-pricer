import { useEffect, useRef, useState } from 'react';
import type { Elemental, SizeUnit, Media, Size, Machine, Product } from '../types';
import type { ProductConfig } from '../data/mockData';
import { MediaSelector } from './configuration/MediaSelector';
import { SizeSelector } from './configuration/SizeSelector';
import { CustomSizeControl } from './configuration/CustomSizeControl';
import { PrintingControl } from './configuration/PrintingControl';
import { PageCountControl } from './configuration/PageCountControl';
import { FinishingOptions } from './configuration/FinishingOptions';
import { Disclosure } from './Disclosure';
import { hasFinishingOptions } from '../lib/finishingRules';
import { resolveMachine, fitsMachine } from '../lib/machine';
import { advancedSummary } from '../lib/personalization';

type ConfigurationPanelProps = {
  element: Elemental;
  onUpdate: (updates: Partial<Elemental>) => void;
  customSizeUnit: SizeUnit;
  onCustomSizeUnitChange: (unit: SizeUnit) => void;
  config: ProductConfig;
  media: Media[];
  sizes: Size[];
  machines: Machine[];
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
  machines,
  baseline,
  productExtras,
}: ConfigurationPanelProps) {
  const advancedRef = useRef<HTMLDivElement>(null);
  const widthInputRef = useRef<HTMLInputElement>(null);
  // Bumped whenever "Personalizat" is clicked, forcing the advanced section
  // open and focus into the width field even if the section was collapsed.
  const [openSignal, setOpenSignal] = useState(0);
  const availableMedia = media.filter((m) => config.allowedMediaIds.includes(m.id));
  const machine = resolveMachine(config, machines);
  const sizesInConfig = sizes.filter((s) => config.allowedSizeIds.includes(s.id));
  const availableSizes = sizesInConfig.filter((s) => fitsMachine(s.widthMm, s.heightMm, machine));
  // Distinct from a size never being in allowedSizeIds to begin with (ordinary
  // catalog data, not worth flagging) — this is specifically the machine
  // taking away a size the config would otherwise offer.
  const hasSizesHiddenByMachine = availableSizes.length < sizesInConfig.length;

  // Falls back to the product-wide rule, the same way printing does below: an
  // element the user added at runtime has an id no catalog could have keyed on.
  const pageCountConstraint = config.elementalPageCounts?.[element.id] ?? config.allowedPageCount;
  const showPageCount = pageCountConstraint?.kind === 'multiple';

  const baseElement = baseline?.elementals.find((e) => e.id === element.id);
  const chips = advancedSummary(element, baseElement, pageCountConstraint);

  useEffect(() => {
    if (openSignal > 0) widthInputRef.current?.focus();
  }, [openSignal]);

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
          onRequestCustomSize={() => {
            setOpenSignal((n) => n + 1);
            advancedRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }}
          machineLimitHidesSizes={hasSizesHiddenByMachine}
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
        <Disclosure label="Opțiuni avansate" chips={chips} resetKey={element.id} openSignal={openSignal}>
          <div className="space-y-5 pt-2">
            <CustomSizeControl
              currentSize={element.size}
              customSizeUnit={customSizeUnit}
              onSizeChange={(size) => onUpdate({ size })}
              onUnitChange={onCustomSizeUnitChange}
              maxWidthMm={machine?.maxWidthMm}
              maxHeightMm={machine?.maxHeightMm}
              widthInputRef={widthInputRef}
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
