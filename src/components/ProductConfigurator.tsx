import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Download, Upload, RotateCcw, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import type { Product, ProductCategory, Elemental, SizeUnit, Binding } from '../types';
import { MOCK_CATALOG } from '../data/catalog';
import type { Catalog } from '../data/catalog';
import { ConfigurationPanel } from './ConfigurationPanel';
import { PreviewCard } from './PreviewCard';
import { AssemblySummary } from './AssemblySummary';
import { ProductButton } from './ProductButton';
import { CategoryButton } from './CategoryButton';
import { NumericButton } from './NumericButton';
import { BindingControl } from './configuration/BindingControl';

type ProductPrice = {
  price: number;
  currency: string;
  timestamp: string;
};

const BINDING_TAB_ID = '__binding__';

const DEFAULT_POWER_TITLE = 'Calculator de prețuri ';
const DEFAULT_TAGLINE = 'Preț precis indiferent de specificul ofertei';

const STEPS = [
  { title: 'Categorie & Produs' },
  { title: 'Personalizare' },
  { title: 'Cantitate Produs' },
  { title: 'Previzualizare & Sumar' },
  { title: 'Preț' },
] as const;

// The full selection that produced a price: posted to the price endpoint and
// shared with the host (pricer:offer event) so it can email / act on the quote.
function buildSelectionPayload(product: Product) {
  return {
    productId: product.id,
    productLabel: product.label,
    amount: product.amount,
    elementals: product.elementals.map(elem => ({
      label: elem.label,
      media: {
        kind: elem.media.kind,
        id: elem.media.id,
        label: elem.media.label,
        gsm: elem.media.gsm,
        ...(elem.media.kind === 'paper'   ? { finish: elem.media.finish } : {}),
        ...(elem.media.kind === 'sticker' ? { face: elem.media.face }     : {}),
      },
      size: {
        width: elem.size.width,
        height: elem.size.height,
        unit: elem.size.unit,
      },
      printing: elem.printing,
      pageCount: elem.pageCount,
      finishing: elem.finishing,
    })),
    ...(product.binding ? { binding: product.binding } : {}),
  };
}

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
  // Host-supplied header markup, injected as raw HTML in place of the whole
  // default title + tagline block. When omitted (standalone dev), the built-in
  // title + tagline are shown. MUST be host-controlled/trusted — it is NOT
  // sanitized (dangerouslySetInnerHTML); never pass untrusted user input (XSS).
  powerText?: string;
};

// ============ MAIN APP ============
export default function ProductConfigurator({
  catalog = MOCK_CATALOG,
  initialCategoryId = null,
  initialProductId = null,
  priceEndpoint = null,
  powerText,
}: ProductConfiguratorProps = {}) {
  const STORAGE_VERSION = 'v2';
  const [products, setProducts] = useState<Product[]>(() => {
    // A host-injected catalog always wins; only standalone dev persists edits.
    if (catalog !== MOCK_CATALOG) return catalog.products;
    const saved = localStorage.getItem('products');
    const version = localStorage.getItem('products_version');
    if (saved && version === STORAGE_VERSION) return JSON.parse(saved) as Product[];
    localStorage.setItem('products_version', STORAGE_VERSION);
    return catalog.products;
  });

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

  const [isWizardMode, setIsWizardMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<ProductCategory['id'] | null>(preselectedCategoryId);
  const [selectedProductId, setSelectedProductId] = useState<Product['id']>(initialProduct?.id ?? '');
  const [selectedElementalId, setSelectedElementalId] = useState<Elemental['id']>(
    initialProduct?.elementals[0]?.id ?? ''
  );
  const [customSizeUnit, setCustomSizeUnit] = useState<SizeUnit>('mm');
  const [productPrices, setProductPrices] = useState<Record<string, ProductPrice>>({});
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find((p: Product) => p.id === selectedProductId);
  const selectedElemental = selectedProduct?.elementals.find(
    (e: Elemental) => e.id === selectedElementalId
  );
  const config = catalog.config[selectedProductId];
  // Multi-element products share one size by default; a config can opt out.
  const sizeShared = config?.sharedSize ?? ((selectedProduct?.elementals.length ?? 1) > 1);

  // When the host preselects a category (or a product, which implies its
  // category), the category is fixed: the user picks a product within it but
  // can't navigate back to the category list.
  const categoryLocked = preselectedCategoryId !== null;

  const showStep = (step: number) => !isWizardMode || currentStep === step;

  // Gate the wizard: the user must select a product (which means first choosing
  // a category) before they can leave the first step.
  const productSelected = !!selectedProduct;
  const goToStep = (index: number) => {
    if (index > 0 && !productSelected) return;
    setCurrentStep(Math.max(0, Math.min(STEPS.length - 1, index)));
  };

  // Save to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const updateElemental = (elementId: Elemental['id'], updates: Partial<Elemental>) => {
    setProducts(
      products.map((product: Product) => ({
        ...product,
        elementals: product.elementals.map((elem) =>
          elem.id === elementId ? { ...elem, ...updates } : elem
        ),
      }))
    );
  };

  const updateBinding = (productId: Product['id'], binding: Binding) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, binding } : p))
    );
  };

  // Apply one size to every elemental of a product (multi-element products
  // physically share a single size).
  const setProductSize = (productId: Product['id'], size: Elemental['size']) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, elementals: p.elementals.map(e => ({ ...e, size })) }
          : p
      )
    );
  };

  // Step the amount by delta (the ± buttons); never below 1.
  const updateProductAmount = (productId: Product['id'], delta: number) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, amount: Math.max(1, p.amount + delta) } : p
      )
    );
  };

  // Set an absolute amount (typing in the field); never below 1.
  const setProductAmount = (productId: Product['id'], amount: number) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, amount: Math.max(1, amount) } : p
      )
    );
  };

  // A product is "personalized" once its elementals/binding diverge from the
  // pristine catalog definition (quantity is a separate step, not a setting).
  const baselineProduct = (id: Product['id']) => catalog.products.find(p => p.id === id);
  const settingsOf = (p: Product) =>
    JSON.stringify({ elementals: p.elementals, binding: p.binding ?? null });
  const isPersonalized = (p: Product) => {
    const base = baselineProduct(p.id);
    return !!base && settingsOf(base) !== settingsOf(p);
  };

  // Restore a product's elementals/binding to the catalog defaults.
  const revertProduct = (id: Product['id']) => {
    const base = baselineProduct(id);
    if (!base) return;
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, elementals: base.elementals, binding: base.binding } : p))
    );
  };

  const getPriceFromAPI = async () => {
    if (!selectedProduct) return;

    setPricingLoading(true);
    setPricingError(null);

    try {
      const productData = buildSelectionPayload(selectedProduct);

      const endpoint = priceEndpoint ?? 'https://your-api-endpoint.com/calculate-price';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`Eroare API: ${response.status}`);
      }

      const result = await response.json();

      setProductPrices(prev => ({
        ...prev,
        [selectedProduct.id]: {
          price: result.price,
          currency: result.currency || 'RON',
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare la obținerea prețului. Verificați endpoint-ul API.';
      setPricingError(message);
      console.error('Pricing error:', error);
    } finally {
      setPricingLoading(false);
    }
  };

  // Announce the quote (selection + price) to the host page, which decides what
  // to do with it (e.g. open a prefilled email). No-op in standalone dev.
  const requestOffer = () => {
    if (!selectedProduct) return;
    const priceInfo = productPrices[selectedProduct.id];
    if (!priceInfo) return;
    rootRef.current?.dispatchEvent(
      new CustomEvent('pricer:offer', {
        bubbles: true,
        detail: {
          selection: buildSelectionPayload(selectedProduct),
          price: priceInfo.price,
          currency: priceInfo.currency,
        },
      })
    );
  };

  const exportProducts = () => {
    const json = JSON.stringify(products, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${Date.now()}.json`;
    a.click();
  };

  const importProducts = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') throw new Error('Conținut fișier invalid');
        const imported = JSON.parse(text) as Product[];
        setProducts(imported);
        setSelectedCategoryId(imported[0].categoryId);
        setSelectedProductId(imported[0].id);
        setSelectedElementalId(imported[0].elementals[0].id);
      } catch (err) {
        console.log(err);
        alert('Fișier JSON nevalid');
      }
    };
    reader.readAsText(file);
  };

  const resetProducts = () => {
    if (confirm('Resetați produsele la valorile implicite?')) {
      setProducts(catalog.products);
      // A host-preselected category stays fixed; otherwise back to a clean
      // slate with no category. Either way the product is re-selected.
      setSelectedCategoryId(preselectedCategoryId);
      setSelectedProductId('');
      setSelectedElementalId('');
      setCurrentStep(0);
    }
  };

  return (
    <div ref={rootRef} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-[21]">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            {powerText ? (
              <div className="min-w-0" dangerouslySetInnerHTML={{ __html: powerText }} />
            ) : (
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 truncate">
                  {DEFAULT_POWER_TITLE}
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {DEFAULT_TAGLINE}
                </p>
              </div>
            )}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={exportProducts}
                className="flex items-center gap-1 sm:gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 transition hover:bg-blue-100 dark:hover:bg-blue-900"
                title="Exportați configurația ca JSON"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <label className="flex cursor-pointer items-center gap-1 sm:gap-2 rounded-lg bg-green-50 dark:bg-green-950 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 transition hover:bg-green-100 dark:hover:bg-green-900">
                <Upload size={16} />
                <span className="hidden sm:inline">Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importProducts}
                  className="hidden"
                />
              </label>
              <button
                onClick={resetProducts}
                className="flex items-center gap-1 sm:gap-2 rounded-lg bg-amber-50 dark:bg-amber-950 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 transition hover:bg-amber-100 dark:hover:bg-amber-900"
                title="Resetare la valorile implicite"
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Resetare</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`mx-auto max-w-7xl px-4 py-4 sm:py-6 ${isWizardMode ? 'pb-20 sm:pb-6' : ''}`}>
        {/* View mode toggle */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
          <label className="flex items-center gap-2 text-base font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isWizardMode}
              onChange={(e) => setIsWizardMode(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
            />
            Mod pas-cu-pas
          </label>

          {isWizardMode && (
            <div className="flex justify-center flex-wrap items-center gap-2">
              {STEPS.map((step, index) => (
                <button
                  key={step.title}
                  onClick={() => goToStep(index)}
                  disabled={index > 0 && !productSelected}
                  className={`w-full sm:w-auto rounded-lg px-3 py-1.5 text-lg font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    currentStep === index
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {index + 1}. {step.title}
                </button>
              ))}
              <div className="w-full sm:w-auto flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  disabled={currentStep === 0}
                  className={`w-full sm:w-auto justify-center flex items-center gap-1 rounded-lg px-3 py-1.5 text-lg font-medium text-white hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none transition ${
                    currentStep === 0 ? 'bg-blue-500 dark:bg-blue-600' : 'nav-glow'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Înapoi
                </button>
                <button
                  onClick={() => goToStep(currentStep + 1)}
                  disabled={currentStep === STEPS.length - 1 || (currentStep === 0 && !productSelected)}
                  className={`w-full sm:w-auto justify-center flex items-center gap-1 rounded-lg px-3 py-1.5 text-lg font-medium text-white hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none transition ${
                    currentStep === STEPS.length - 1 ? 'bg-blue-500 dark:bg-blue-600' : 'nav-glow'
                  }`}
                >
                  Înainte
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky step navigation for small screens, so prev/next stay reachable while scrolling */}
        {isWizardMode && (
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 flex gap-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
            <button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none transition ${
                currentStep === 0 ? 'bg-blue-500 dark:bg-blue-600' : 'nav-glow'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Înapoi
            </button>
            <button
              onClick={() => goToStep(currentStep + 1)}
              disabled={currentStep === STEPS.length - 1 || (currentStep === 0 && !productSelected)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none transition ${
                currentStep === STEPS.length - 1 ? 'bg-blue-500 dark:bg-blue-600' : 'nav-glow'
              }`}
            >
              Înainte
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Products Grid */}
        {showStep(0) && (
          <div className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm mb-6">
            {selectedCategoryId === null ? (
              <>
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Selectați Categoria
                </h2>
                <div className="w-full flex flex-wrap gap-4">
                  {catalog.categories.map((category: ProductCategory) => (
                    <CategoryButton
                      key={category.id}
                      category={category}
                      selectedCategoryId={selectedCategoryId ?? undefined}
                      presetCount={products.filter((p) => p.categoryId === category.id).length}
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        // Drop any product not in the newly chosen category so
                        // the user is forced to pick one that belongs to it.
                        if (selectedProduct?.categoryId !== category.id) {
                          setSelectedProductId('');
                          setSelectedElementalId('');
                        }
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-3">
                  {!categoryLocked && (
                    <button
                      onClick={() => setSelectedCategoryId(null)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                    >
                      ← Înapoi la categorii
                    </button>
                  )}
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {catalog.categories.find((c) => c.id === selectedCategoryId)?.label}
                  </h2>
                </div>
                <div className="w-full flex flex-wrap gap-4">
                  {products
                    .filter((product: Product) => product.categoryId === selectedCategoryId)
                    .map((product: Product) => (
                      <ProductButton
                        key={product.id}
                        product={product}
                        selectedProductId={selectedProductId}
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setSelectedElementalId(product.elementals[0].id);
                        }}
                        badgeText={catalog.config[product.id]?.explanation}
                        personalized={isPersonalized(product)}
                        onRevert={() => revertProduct(product.id)}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Current product amount */}
        {showStep(2) && selectedProduct && (
          <>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Cantitate Produs
          </h2>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm mb-6">
          <div className="flex flex-wrap justify-center items-center gap-2">
            <div className="flex flex-1 max-w-9xl justify-center items-center gap-1 bg-slate-100 dark:bg-slate-600 rounded px-2 py-1">
              <NumericButton
                style="flex-1"
                onClickMinus={() => updateProductAmount(selectedProduct.id, -1)}
                onChange={(e) => {
                  const n = parseInt(e.currentTarget.value, 10);
                  if (!Number.isNaN(n)) setProductAmount(selectedProduct.id, n);
                }}
                onClickPlus={() => updateProductAmount(selectedProduct.id, +1)}
                value={selectedProduct.amount}
                badgeText={config?.explanation}
              />
            </div>
          </div>
        </div>
          </>
        )}

        {/* Configuration Panel */}
        {showStep(1) && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm mb-6">
          {/* Elementals Tabs */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {selectedProduct?.elementals.map((element: Elemental) => (
              <button
                key={element.id}
                onClick={() => setSelectedElementalId(element.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedElementalId === element.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {element.label}
              </button>
            ))}
            {config?.binding?.type === 'spiral' && (
              <button
                onClick={() => setSelectedElementalId(BINDING_TAB_ID)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedElementalId === BINDING_TAB_ID
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Spirală
              </button>
            )}
          </div>

          {selectedElementalId === BINDING_TAB_ID && config?.binding?.type === 'spiral' && selectedProduct ? (
            <BindingControl
              binding={selectedProduct.binding}
              allowedColors={config.binding.allowedColors ?? []}
              onChange={(binding) => updateBinding(selectedProduct.id, binding)}
            />
          ) : selectedElemental && config && (
            <ConfigurationPanel
              element={selectedElemental}
              onUpdate={(updates: Partial<Elemental>) => {
                if (sizeShared && updates.size && selectedProduct) {
                  const { size, ...rest } = updates;
                  setProductSize(selectedProduct.id, size);
                  if (Object.keys(rest).length) updateElemental(selectedElemental.id, rest);
                } else {
                  updateElemental(selectedElemental.id, updates);
                }
              }}
              customSizeUnit={customSizeUnit}
              onCustomSizeUnitChange={setCustomSizeUnit}
              config={config}
              media={catalog.media}
              sizes={catalog.sizes}
            />
          )}
        </div>
        )}

        {/* Preview & Summary */}
        {showStep(3) && (
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-72"><PreviewCard element={selectedElemental} /></div>
          <div className="flex-1 min-w-72"><AssemblySummary product={selectedProduct} personalized={!!selectedProduct && isPersonalized(selectedProduct)} /></div>
        </div>
        )}

        {/* Pricing */}
        {showStep(4) && selectedProduct && (
          <>
          <h2 className="mb-3 mt-6 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Preț
          </h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm mb-6">
            {/* Get Price Button */}
            <button
              onClick={getPriceFromAPI}
              disabled={pricingLoading}
              className="w-full max-w-[200px] mx-auto rounded bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 px-4 py-2.5 text-sm font-semibold text-white transition shadow-sm flex items-center justify-center gap-2"
            >
              {pricingLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Se calculează...
                </>
              ) : (
                '💰 Obține Preț'
              )}
            </button>

            {/* Price Display */}
            {productPrices[selectedProduct.id] && (
              <div className="mt-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <div className="text-xs text-emerald-700 dark:text-emerald-300 mb-1 font-medium">Preț unitar:</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">
                  {productPrices[selectedProduct.id].currency} {productPrices[selectedProduct.id].price.toFixed(2)}
                </div>
                <div className="bg-white dark:bg-emerald-900 rounded p-2 mb-2">
                  <div className="text-xs text-emerald-900 dark:text-emerald-200">
                    <span className="font-semibold">Total pentru {selectedProduct.amount} {selectedProduct.amount !== 1 ? 'unități' : 'unitate'}:</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {productPrices[selectedProduct.id].currency} {(productPrices[selectedProduct.id].price * selectedProduct.amount).toFixed(2)}
                  </div>
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  Ultima actualizare: {new Date(productPrices[selectedProduct.id].timestamp).toLocaleTimeString()}
                </div>
                <button
                  onClick={requestOffer}
                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200 transition hover:bg-emerald-100 dark:hover:bg-emerald-800"
                >
                  <Mail size={16} />
                  Cere ofertă pe email
                </button>
              </div>
            )}

            {/* Error Display */}
            {pricingError && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                <div className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">⚠️ Eroare:</div>
                <div className="text-sm text-red-600 dark:text-red-400 mb-2">{pricingError}</div>
                <div className="text-xs text-red-600 dark:text-red-400">
                  💡 Asigurați-vă că URL-ul endpoint-ului API este configurat corect și returnează: {'{'} price: number, currency?: string {'}'}
                </div>
              </div>
            )}
          </div>
          </>
        )}
      </main>
    </div>
  );
}
