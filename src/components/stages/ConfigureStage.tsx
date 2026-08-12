import { useRef } from 'react';
import type { Product, Elemental, SizeUnit, Binding } from '../../types';
import type { Catalog } from '../../data/catalog';
import { ConfigurationPanel } from '../ConfigurationPanel';
import { BindingControl } from '../configuration/BindingControl';
import { PocketControl } from '../configuration/PocketControl';

type ConfigureStageProps = {
  catalog: Catalog;
  product: Product | undefined;
  selectedElementalId: Elemental['id'];
  onSelectElemental: (id: Elemental['id']) => void;
  customSizeUnit: SizeUnit;
  onCustomSizeUnitChange: (unit: SizeUnit) => void;
  onUpdateElemental: (elementId: Elemental['id'], updates: Partial<Elemental>) => void;
  onUpdateBinding: (productId: Product['id'], binding: Binding) => void;
  onSetProductSize: (productId: Product['id'], size: Elemental['size']) => void;
};

export function ConfigureStage({
  catalog,
  product,
  selectedElementalId,
  onSelectElemental,
  customSizeUnit,
  onCustomSizeUnitChange,
  onUpdateElemental,
  onUpdateBinding,
  onSetProductSize,
}: ConfigureStageProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const config = product ? catalog.config[product.id] : undefined;
  const selectedElemental = product?.elementals.find((e) => e.id === selectedElementalId);
  // Multi-element products share one size by default; a config can opt out.
  const sizeShared = config?.sharedSize ?? ((product?.elementals.length ?? 1) > 1);
  const elementals = product?.elementals ?? [];

  // Left/Right move between tabs, per the tablist pattern.
  const handleTabKey = (event: React.KeyboardEvent, index: number) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = elementals[(index + delta + elementals.length) % elementals.length];
    onSelectElemental(next.id);
    tabsRef.current?.querySelectorAll('button')[elementals.indexOf(next)]?.focus();
  };

  // Product-wide accessories. They used to occupy synthetic tabs alongside the
  // elementals, which implied they were parts of the product you configure the
  // same way; they are settings of the whole thing, so they sit in the advanced
  // section instead. PocketControl is read-only — a "what's included" note.
  const productExtras =
    product && config && (config.binding?.type === 'spiral' || config.pocket) ? (
      <div className="space-y-5">
        {config.binding?.type === 'spiral' && (
          <BindingControl
            binding={product.binding}
            allowedColors={config.binding.allowedColors ?? []}
            onChange={(binding) => onUpdateBinding(product.id, binding)}
          />
        )}
        {config.pocket && <PocketControl pocket={config.pocket} media={catalog.media} />}
      </div>
    ) : null;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
      {/* One tab per physical part of the product (cover, interior, …). Single
          -part products get no tab row at all — there is nothing to switch. */}
      {elementals.length > 1 && (
        <div ref={tabsRef} role="tablist" aria-label="Elemente" className="mb-4 flex flex-wrap gap-1.5">
          {elementals.map((element: Elemental, index: number) => {
            const active = selectedElementalId === element.id;
            return (
              <button
                key={element.id}
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onClick={() => onSelectElemental(element.id)}
                onKeyDown={(e) => handleTabKey(e, index)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {element.label}
              </button>
            );
          })}
        </div>
      )}

      {/* A product with no config entry used to render the tab row over a blank
          panel, with nothing to say why — the catalog and the product list can
          drift apart (a product added without its config). Say so instead. */}
      {product && !config && (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Acest produs nu are o configurație definită în catalog, așa că nu poate fi
          personalizat. ({product.id})
        </p>
      )}

      {selectedElemental && config && product && (
        <ConfigurationPanel
          element={selectedElemental}
          onUpdate={(updates: Partial<Elemental>) => {
            // A shared size belongs to the product, so it fans out to every
            // elemental; anything else stays on the selected one.
            if (sizeShared && updates.size) {
              const { size, ...rest } = updates;
              onSetProductSize(product.id, size);
              if (Object.keys(rest).length) onUpdateElemental(selectedElemental.id, rest);
            } else {
              onUpdateElemental(selectedElemental.id, updates);
            }
          }}
          customSizeUnit={customSizeUnit}
          onCustomSizeUnitChange={onCustomSizeUnitChange}
          config={config}
          media={catalog.media}
          sizes={catalog.sizes}
          baseline={catalog.products.find((p) => p.id === product.id)}
          productExtras={productExtras}
        />
      )}
    </div>
  );
}
