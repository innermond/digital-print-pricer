import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Download, Upload, RotateCcw, } from 'lucide-react';
import type { Product, Elemental, SizeUnit } from '../types';
import { MOCK_PRODUCTS, PRODUCT_CONFIG } from '../data/mockData';
import { ConfigurationPanel } from './ConfigurationPanel';
import { PreviewCard } from './PreviewCard';
import { AssemblySummary } from './AssemblySummary';
import { ProductButton } from './ProductButton';
import { NumericButton } from './NumericButton';

type ProductPrice = {
  price: number;
  currency: string;
  timestamp: string;
};

// ============ MAIN APP ============
export default function ProductConfigurator() {
  const STORAGE_VERSION = 'v5';
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    const version = localStorage.getItem('products_version');
    if (saved && version === STORAGE_VERSION) return JSON.parse(saved) as Product[];
    localStorage.setItem('products_version', STORAGE_VERSION);
    return MOCK_PRODUCTS;
  });

  const [selectedProductId, setSelectedProductId] = useState<Product['id']>(products[0].id);
  const [selectedElementalId, setSelectedElementalId] = useState<Elemental['id']>(
    products[0].elementals[0].id
  );
  const [customSizeUnit, setCustomSizeUnit] = useState<SizeUnit>('mm');
  const [productPrices, setProductPrices] = useState<Record<string, ProductPrice>>({});
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  const selectedProduct = products.find((p: Product) => p.id === selectedProductId);
  const selectedElemental = selectedProduct?.elementals.find(
    (e: Elemental) => e.id === selectedElementalId
  );
  const config = PRODUCT_CONFIG[selectedProductId];

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

  const updateProduct = (productId: Product['id'], updates: Partial<Product>) => {
    setProducts(
      products.map((p: Product) =>
        p.id === productId ? { ...p, ...updates } : p
      )
    );
  };

const updateProductAmount = (productId: Product['id'], delta: number) => {
  setProducts(prev =>
    prev.map(p =>
      p.id === productId
        ? { ...p, amount: Math.max(1, Math.abs(delta) > 1 ? delta : p.amount + delta) }
        : p
    )
  );
};

  const getPriceFromAPI = async () => {
    if (!selectedProduct) return;

    setPricingLoading(true);
    setPricingError(null);

    try {
      // Prepare the product data to send to the API
      const productData = {
        productId: selectedProduct.id,
        productLabel: selectedProduct.label,
        amount: selectedProduct.amount,
        elementals: selectedProduct.elementals.map(elem => ({
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
          finishing: elem.finishing,
        })),
      };

      console.log(productData)

      // Call your API endpoint - update this URL to your actual API
      const response = await fetch('https://your-api-endpoint.com/calculate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      // Store the price for this product
      setProductPrices(prev => ({
        ...prev,
        [selectedProduct.id]: {
          price: result.price,
          currency: result.currency || 'USD',
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get price. Please check your API endpoint.';
      setPricingError(message);
      console.error('Pricing error:', error);
    } finally {
      setPricingLoading(false);
    }
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
        if (typeof text !== 'string') throw new Error('Invalid file content');
        const imported = JSON.parse(text) as Product[];
        setProducts(imported);
        setSelectedProductId(imported[0].id);
        setSelectedElementalId(imported[0].elementals[0].id);
      } catch (err) {
        console.log(err);
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const resetProducts = () => {
    if (confirm('Reset all products to defaults?')) {
      setProducts(MOCK_PRODUCTS);
      setSelectedProductId(MOCK_PRODUCTS[0].id);
      setSelectedElementalId(MOCK_PRODUCTS[0].elementals[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-[21]">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 truncate">
                Product Configurator
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Customize print products with precision
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={exportProducts}
                className="flex items-center gap-1 sm:gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 transition hover:bg-blue-100 dark:hover:bg-blue-900"
                title="Export configuration as JSON"
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
                title="Reset to default products"
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="overflow-hidden mx-auto max-w-7xl px-4 py-4 sm:py-6">
        {/* Products Grid (Row-oriented) */}
          <div className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm mb-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
              Select Product
            </h2>
            <div className="w-full flex flex-wrap gap-4">
              {products.map((product: Product) => (
                <ProductButton
                  key={product.id}
                  product={product}
                  selectedProductId={selectedProductId}
                  onClick={() => {
                    setSelectedProductId(product.id);
                    setSelectedElementalId(product.elementals[0].id);
                  }}
badgeText="<p class='max-w-xs'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software including versions of Lorem Ipsum.</p>"
                />
              ))}
            </div>
          </div>

        {/* Current product amount */}
        {selectedProduct && (
          <>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Product Amount
          </h2>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm mb-6">
          <div className="flex flex-wrap justify-center items-center gap-2">
            <div className="flex flex-1 max-w-9xl justify-center items-center gap-1 bg-slate-100 dark:bg-slate-600 rounded px-2 py-1">
              <NumericButton
                style="flex-1"
                onClickMinus={() => updateProductAmount(selectedProduct.id, -1)}
                onChange={(e) => updateProductAmount(selectedProduct.id, parseInt(e.currentTarget.value))}
                onClickPlus={() => updateProductAmount(selectedProduct.id, +1)}
                value={selectedProduct.amount}
badgeText="<p class='max-w-xs'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software including versions of Lorem Ipsum.</p>"
              />
            </div>
            {/* Get Price Button */}
            <button
              onClick={getPriceFromAPI}
              disabled={pricingLoading}
              className="flex-1 whitespace-nowrap
 max-w-[120px] rounded bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 px-4 py-2.5 text-sm font-semibold text-white transition shadow-sm flex items-center justify-center gap-2"
            >
              {pricingLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Calculating Price...
                </>
              ) : (
                '💰 Get Price'
              )}
            </button>
          </div>

              {/* Price Display */}
              {productPrices[selectedProduct.id] && (
                <div className="mt-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 mb-1 font-medium">Unit Price:</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">
                    {productPrices[selectedProduct.id].currency} {productPrices[selectedProduct.id].price.toFixed(2)}
                  </div>
                  <div className="bg-white dark:bg-emerald-900 rounded p-2 mb-2">
                    <div className="text-xs text-emerald-900 dark:text-emerald-200">
                      <span className="font-semibold">Total for {selectedProduct.amount} unit{selectedProduct.amount !== 1 ? 's' : ''}:</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                      {productPrices[selectedProduct.id].currency} {(productPrices[selectedProduct.id].price * selectedProduct.amount).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                    Last updated: {new Date(productPrices[selectedProduct.id].timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {pricingError && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <div className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">⚠️ Error:</div>
                  <div className="text-sm text-red-600 dark:text-red-400 mb-2">{pricingError}</div>
                  <div className="text-xs text-red-600 dark:text-red-400">
                    💡 Make sure your API endpoint URL is configured correctly and returns: {'{'} price: number, currency?: string {'}'}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Configuration Panel */}
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
          </div>

          {selectedElemental && config && (
            <ConfigurationPanel
              element={selectedElemental}
              onUpdate={(updates: Partial<Elemental>) =>
                updateElemental(selectedElemental.id, updates)
              }
              customSizeUnit={customSizeUnit}
              onCustomSizeUnitChange={setCustomSizeUnit}
              config={config}
            />
          )}
        </div>

        {/* Preview & Summary */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-72"><PreviewCard element={selectedElemental} /></div>
          <div className="flex-1 min-w-72"><AssemblySummary product={selectedProduct} /></div>
        </div>
      </main>
    </div>
  );
}
