import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Download, Upload, RotateCcw, Minus, Plus } from 'lucide-react';
import type { Product, Elemental, SizeUnit } from '../types';
import { MOCK_PRODUCTS, PRODUCT_CONFIG } from '../data/mockData';
import { ConfigurationPanel } from './ConfigurationPanel';
import { PreviewCard } from './PreviewCard';
import { AssemblySummary } from './AssemblySummary';
import { Badge } from './Badge';

type ProductPrice = {
  price: number;
  currency: string;
  timestamp: string;
};

// ============ MAIN APP ============
export default function ProductConfigurator() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? (JSON.parse(saved) as Product[]) : MOCK_PRODUCTS;
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

  const updateProductAmount = (productId: Product['id'], amount: number) => {
    updateProduct(productId, { amount: Math.max(1, amount) });
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
          paper: {
            id: elem.paper.id,
            label: elem.paper.label,
            gsm: elem.paper.gsm,
            finish: elem.paper.finish,
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
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10">
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
      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
        {/* Products Grid (Row-oriented) */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm mb-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Select Product
          </h2>
          <Badge text="<p class='max-w-xs'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software including versions of Lorem Ipsum.</p>">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((product: Product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProductId(product.id);
                  setSelectedElementalId(product.elementals[0].id);
                }}
                className={`rounded-lg border-2 px-4 py-3 text-left transition ${
                  selectedProductId === product.id
                    ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {product.label}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {product.elementals.length} element{product.elementals.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </button>
            ))}
          </div>
          </Badge>
        </div>

        {/* Current product amount */}
        {selectedProduct && (
          <>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Product Amount
          </h2>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm mb-6">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-600 rounded px-2 py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateProductAmount(selectedProduct.id, selectedProduct.amount - 1);
                      }}
                      className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-500 rounded"
                    >
                      <Minus size={14} className="text-slate-700 dark:text-slate-300" />
                    </button>
                      <input   type="text"
                        pattern="(?:0|[1-9]\d*)"
                        inputMode="decimal"
                        autoComplete="off"
                        size={Math.max(String(selectedProduct.amount).length, 1)}
                        value={selectedProduct.amount}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateProductAmount(selectedProduct.id, parseInt(e.currentTarget.value));
                        }}
                        className="text-center text-xs font-semibold text-slate-900 dark:text-slate-50"
                      />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateProductAmount(selectedProduct.id, selectedProduct.amount + 1);
                      }}
                      className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-500 rounded"
                    >
                      <Plus size={14} className="text-slate-700 dark:text-slate-300" />
                    </button>
                  </div>

            {/* Get Price Button */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <button
                onClick={getPriceFromAPI}
                disabled={pricingLoading}
                className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 px-4 py-2.5 text-sm font-semibold text-white transition shadow-sm flex items-center justify-center gap-2"
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PreviewCard element={selectedElemental} />
          <AssemblySummary product={selectedProduct} />
        </div>
      </main>
    </div>
  );
}
