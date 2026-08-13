import { useState, useRef, useEffect } from 'react';
import type { Product, ProductCategory, Elemental, SizeUnit } from '../types';
import { MOCK_CATALOG, warnIfCatalogPredatesRoundedCorners, warnIfCatalogPredatesMachine } from '../data/catalog';
import type { Catalog } from '../data/catalog';
import { AppHeader } from './AppHeader';
import { StageProgress, StageNav } from './StageProgress';
import { STAGES } from '../lib/stages';
import type { StageIndex } from '../lib/stages';
import { ProductStage } from './stages/ProductStage';
import { ConfigureStage } from './stages/ConfigureStage';
import { SummaryStage } from './stages/SummaryStage';
import { PricePanel } from './PricePanel';
import { useProducts } from '../hooks/useProducts';
import { useAutoPrice } from '../hooks/useAutoPrice';
import { buildSelectionPayload } from '../lib/selection';
import { pocketElemental } from '../lib/pocket';

type ProductConfiguratorProps = {
  // When embedded (e.g. in materialpublicitar), the host injects a catalog
  // fetched from its endpoint. When omitted (standalone dev), use MOCK_CATALOG.
  catalog?: Catalog;
  // Open the wizard already focused on a category/product. Host pages map their
  // marketing entity to a configurator id; unknown ids are ignored gracefully.
  initialCategoryId?: string | null;
  initialProductId?: string | null;
  // Endpoint that prices a selection (host app, e.g. materialpublicitar). When
  // omitted (standalone dev), the built-in placeholder URL is used.
  priceEndpoint?: string | null;
  // Host-supplied header markup — see AppHeader (NOT sanitized; XSS risk).
  powerText?: string;
  // Show the Export/Import admin tools in the header. Hidden by default —
  // a host must opt in explicitly. Resetare is always shown regardless.
  showExportImport?: boolean;
};

// ============ MAIN APP ============
export default function ProductConfigurator({
  catalog = MOCK_CATALOG,
  initialCategoryId = null,
  initialProductId = null,
  priceEndpoint = null,
  powerText,
  showExportImport = false,
}: ProductConfiguratorProps = {}) {
  // A host-injected catalog always wins; only standalone dev persists edits.
  // Compared by identity here so useProducts never has to re-derive it.
  const {
    products,
    updateElemental,
    updateBinding,
    updatePocketEnabled,
    setProductSize,
    updateProductAmount,
    setProductAmount,
    isPersonalized,
    revertProduct,
    exportProducts,
    importProducts,
    resetProducts,
  } = useProducts({ catalog, persist: catalog === MOCK_CATALOG });

  // Resolve the requested preselection against the actual catalog; a known
  // product implies its category, so a product page can land straight on it.
  const preselectedProduct = initialProductId
    ? products.find((p) => p.id === initialProductId)
    : undefined;
  const preselectedCategoryId =
    (initialCategoryId && catalog.categories.some((c) => c.id === initialCategoryId)
      ? initialCategoryId
      : undefined) ?? preselectedProduct?.categoryId ?? null;
  // No auto-selection: the user must pick a category then a product. Only an
  // explicit (and valid) host preselection lands on a product up front.
  const initialProduct = preselectedProduct;

  // A host preselection leaves the first stage with nothing to do, so open on
  // Configurare and price immediately.
  const [stage, setStage] = useState<StageIndex>(initialProduct ? 1 : 0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<ProductCategory['id'] | null>(preselectedCategoryId);
  const [selectedProductId, setSelectedProductId] = useState<Product['id']>(initialProduct?.id ?? '');
  const [selectedElementalId, setSelectedElementalId] = useState<Elemental['id']>(
    initialProduct?.elementals[0]?.id ?? ''
  );
  const [customSizeUnit, setCustomSizeUnit] = useState<SizeUnit>('mm');
  const rootRef = useRef<HTMLDivElement>(null);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);

  const selectedProduct = products.find((p: Product) => p.id === selectedProductId);
  const selectedElemental = selectedProduct?.elementals.find(
    (e: Elemental) => e.id === selectedElementalId
  );
  const config = catalog.config[selectedProductId];
  // Undefined means on — matches the pocket always showing before this field existed.
  const pocketOn = selectedProduct?.pocketEnabled ?? true;
  // Derived, never stored: the pocket only takes Elemental shape for the payload.
  // Left to the React Compiler to memoize — a hand-written useMemo here had
  // narrower deps than the compiler could infer, so it skipped the component.
  const pocketElem = config?.pocket && pocketOn ? pocketElemental(config.pocket, catalog.media) : null;

  const { status: priceStatus, retry: retryPrice } = useAutoPrice({
    product: selectedProduct,
    pocketElem,
    endpoint: priceEndpoint,
  });

  // When the host preselects a category (or a product, which implies its
  // category), the category is fixed.
  const categoryLocked = preselectedCategoryId !== null;

  // Gate the flow: the user must select a product (which means first choosing
  // a category) before they can leave the first stage.
  const productSelected = !!selectedProduct;
  const goToStage = (index: StageIndex) => {
    if (index > 0 && !productSelected) return;
    setStage(Math.max(0, Math.min(STAGES.length - 1, index)) as StageIndex);
  };

  // Send focus to the new stage's heading so keyboard and screen-reader users
  // land on the content rather than back at the top of the document.
  useEffect(() => {
    stageHeadingRef.current?.focus();
  }, [stage]);

  // Dev-only: flag a host catalog that predates `allowedRoundedCorners`. In an
  // effect rather than in render, so it runs once per catalog, not per re-render.
  useEffect(() => {
    warnIfCatalogPredatesRoundedCorners(catalog);
    warnIfCatalogPredatesMachine(catalog);
  }, [catalog]);

  const selectCategory = (categoryId: ProductCategory['id'] | null) => {
    setSelectedCategoryId(categoryId);
    // Drop any product not in the newly chosen category so the user is forced
    // to pick one that belongs to it.
    if (categoryId !== null && selectedProduct?.categoryId !== categoryId) {
      setSelectedProductId('');
      setSelectedElementalId('');
    }
  };

  const selectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setSelectedElementalId(product.elementals[0].id);
  };

  // Announce the quote (selection + price) to the host page, which decides what
  // to do with it (e.g. open a prefilled email). No-op in standalone dev.
  // Only fires on an `ok` status, so the price always matches the selection
  // being sent — the panel disables the button otherwise.
  const requestOffer = () => {
    if (!selectedProduct || priceStatus.kind !== 'ok') return;
    rootRef.current?.dispatchEvent(
      new CustomEvent('pricer:offer', {
        bubbles: true,
        detail: {
          selection: buildSelectionPayload(selectedProduct, pocketElem),
          price: priceStatus.quote.price,
          currency: priceStatus.quote.currency,
        },
      })
    );
  };

  return (
    <div ref={rootRef} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
      <AppHeader
        powerText={powerText}
        showExportImport={showExportImport}
        onExport={exportProducts}
        onImport={(e) => importProducts(e, (imported) => {
          setSelectedCategoryId(imported[0].categoryId);
          setSelectedProductId(imported[0].id);
          setSelectedElementalId(imported[0].elementals[0].id);
        })}
        onReset={() => resetProducts(() => {
          // A host-preselected category stays fixed; otherwise back to a clean
          // slate with no category. Either way the product is re-selected.
          setSelectedCategoryId(preselectedCategoryId);
          setSelectedProductId('');
          setSelectedElementalId('');
          setStage(0);
        })}
      />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
        <StageProgress stage={stage} unlocked={productSelected} onGoToStage={goToStage} />

        {/* Content left, price right: the number stays in view while the
            configuration that produces it is being changed. */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <h2
              ref={stageHeadingRef}
              tabIndex={-1}
              className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-50 outline-none"
            >
              {STAGES[stage].title}
            </h2>
            {selectedProduct && (
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                {selectedProduct.label}
              </p>
            )}

            {stage === 0 && (
              <ProductStage
                catalog={catalog}
                products={products}
                selectedCategoryId={selectedCategoryId}
                selectedProductId={selectedProductId}
                categoryLocked={categoryLocked}
                onSelectCategory={selectCategory}
                onSelectProduct={selectProduct}
                isPersonalized={isPersonalized}
                onRevert={revertProduct}
              />
            )}

            {stage === 1 && (
              <ConfigureStage
                catalog={catalog}
                product={selectedProduct}
                selectedElementalId={selectedElementalId}
                onSelectElemental={setSelectedElementalId}
                customSizeUnit={customSizeUnit}
                onCustomSizeUnitChange={setCustomSizeUnit}
                onUpdateElemental={updateElemental}
                onUpdateBinding={updateBinding}
                onUpdatePocketEnabled={updatePocketEnabled}
                onSetProductSize={setProductSize}
              />
            )}

            {stage === 2 && (
              <SummaryStage
                product={selectedProduct}
                element={selectedElemental}
                pocket={pocketOn ? config?.pocket : undefined}
                personalized={!!selectedProduct && isPersonalized(selectedProduct)}
              />
            )}

            <StageNav stage={stage} unlocked={productSelected} onGoToStage={goToStage} />
          </div>

          {/* The price follows the selection through every stage rather than
              living on one of its own: quantity is the biggest price lever, so
              the stepper belongs next to the total it changes. */}
          {selectedProduct && (
            <div className="lg:w-72 lg:flex-shrink-0 lg:sticky lg:top-24">
              <PricePanel
                product={selectedProduct}
                status={priceStatus}
                onRetry={retryPrice}
                onRequestOffer={requestOffer}
                onAmountStep={(delta) => updateProductAmount(selectedProduct.id, delta)}
                onAmountSet={(amount) => setProductAmount(selectedProduct.id, amount)}
                showOffer={stage === 2}
                amountBadgeText={config?.explanation}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
