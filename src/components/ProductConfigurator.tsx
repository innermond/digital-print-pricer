import React, { useState, useEffect } from 'react';
import { Download, Upload, RotateCcw, Minus, Plus } from 'lucide-react';
import type { Paper, Size, SizeUnit, Product, Elemental } from '../types';

// ============ UNIT CONVERSION UTILITIES ============
const UNIT_TO_MM = {
  mm: 1,
  in: 25.4,
  pt: 0.352778,
};

const MM_TO_UNIT = {
  mm: 1,
  in: 1 / 25.4,
  pt: 1 / 0.352778,
};

const convertSize = (value: number, fromUnit: SizeUnit, toUnit: SizeUnit) => {
  const inMM = value * UNIT_TO_MM[fromUnit];
  const result = inMM * MM_TO_UNIT[toUnit];
  return Math.round(result * 100) / 100;
};

// ============ MOCK DATA ============
const MOCK_PAPERS: Paper[] = [
  { id: 'p1', label: '80 GSM - Silk', gsm: 80, finish: 'Silk' },
  { id: 'p2', label: '130 GSM - Gloss', gsm: 130, finish: 'Gloss' },
  { id: 'p3', label: '170 GSM - Matt', gsm: 170, finish: 'Matt' },
  { id: 'p4', label: '200 GSM - Soft-touch', gsm: 200, finish: 'Soft-touch' },
  { id: 'p5', label: '250 GSM - Gloss (Premium)', gsm: 250, finish: 'Gloss' },
  { id: 'p6', label: '350 GSM - Matt (Premium)', gsm: 350, finish: 'Matt' },
];

const MOCK_SIZES: Size[] = [
  { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm' },
  { id: 's2', label: 'A5', width: 148, height: 210, unit: 'mm' },
  { id: 's3', label: 'Letter', width: 8.5, height: 11, unit: 'in' },
  { id: 's4', label: 'Flyer 1/3A4', width: 100, height: 210, unit: 'mm' },
  { id: 's5', label: 'Business Card Classic', width: 90, height: 50, unit: 'mm' },
  { id: 's6', label: 'Business Card Compact', width: 80, height: 50, unit: 'mm' },
];


const allowedLaminationTypes =  (p: Paper) => {
  if (p.gsm < 170) return false;
  return true;
};

// Product configuration: what options are valid for each product
const PRODUCT_CONFIG = {
  prod1: { // Flyer
    allowedPaperIds: ['p1', 'p2', 'p3', 'p4'],
    allowedSizeIds: ['s4', 's3', 's2', 's1'],
    recommendedPaperId: 'p2',
    recommendedSizeId: 's4',
    allowedFoldTypes: ['none'],
  },
  prod2: { // Brochure
    allowedPaperIds: ['p2', 'p3', 'p4', 'p5'],
    allowedSizeIds: ['s1', 's2'],
    recommendedPaperId: 'p3',
    recommendedSizeId: 's1',
    allowedFoldTypes: ['none', 'half-fold'],
  },
  prod3: { // Presentation Folder
    allowedPaperIds: ['p3', 'p4', 'p5', 'p6'],
    allowedSizeIds: ['s1', 's2'],
    recommendedPaperId: 'p4',
    recommendedSizeId: 's1',
    allowedFoldTypes: ['none', 'half-fold'],
  },
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    label: 'Flyer',
    amount: 1,
    elementals: [
      {
        id: 'elem1-1',
        label: 'Single Sheet',
        paper: MOCK_PAPERS[1],
        size: { id: 's4', label: 'Flyer', width: 100, height: 200, unit: 'mm' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { count: 0 },
        },
      },
    ],
  },
  {
    id: 'prod2',
    label: 'Brochure (Tri-fold)',
    amount: 1,
    elementals: [
      {
        id: 'elem2-1',
        label: 'Cover',
        paper: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm' },
        finishing: {
          lamination: { type: 'gloss', sides: 'both' },
          folding: { type: 'half-fold', folds: 1 },
          creasing: { count: 1 },
          roundedCornes: { count: 0 },
        },
      },
      {
        id: 'elem2-2',
        label: 'Interior',
        paper: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'half-fold', folds: 1 },
          creasing: { count: 0 },
          roundedCornes: { count: 0 },
        },
      },
      {
        id: 'elem2-3',
        label: 'Back Cover',
        paper: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm' },
        finishing: {
          lamination: { type: 'matt', sides: 'back' },
          folding: { type: 'tri-fold', folds: 2 },
          creasing: { count: 1 },
          roundedCornes: { count: 0 },
        },
      },
    ],
  },
  {
    id: 'prod3',
    label: 'Presentation Folder',
    amount: 1,
    elementals: [
      {
        id: 'elem3-1',
        label: 'Folded A3 sheet',
        paper: MOCK_PAPERS[3],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm' },
        finishing: {
          lamination: { type: 'soft-touch', sides: 'both' },
          folding: { type: 'half-fold', folds: 1 },
          creasing: { count: 1 },
          roundedCornes: { count: 0 },
        },
      },
      {
        id: 'elem3-2',
        label: 'Paper Pocket',
        paper: MOCK_PAPERS[2],
        size: { id: 's2', label: 'A5', width: 148, height: 210, unit: 'mm' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { count: 4 },
        },
      },
    ],
  },
];

// ============ MAIN APP ============
export default function ProductConfigurator() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });

  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [selectedElementalId, setSelectedElementalId] = useState(
    products[0].elementals[0].id
  );
  const [customSizeUnit, setCustomSizeUnit] = useState('mm');

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

  const exportProducts = () => {
    const json = JSON.stringify(products, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${Date.now()}.json`;
    a.click();
  };

  const importProducts = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
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
        </div>

        {/* Current product amount */}
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
</div>

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

// ============ CONFIGURATION PANEL ============
function ConfigurationPanel({ element, onUpdate, customSizeUnit, onCustomSizeUnitChange, config }) {
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
            {['mm', 'in', 'pt'].map((unit) => (
              <button
                key={unit}
                onClick={() => handleUnitChange(unit as SizeUnit)}
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
              {['none', 'gloss', 'matt', 'soft-touch'].map((type) => {
                const isAllowed = allowedLaminationTypes(element.paper);
                return (
                <button
                  key={type}
                  onClick={() =>
                    onUpdate({
                      finishing: {
                        ...element.finishing,
                        lamination: {
                          ...element.finishing.lamination,
                          type,
                        },
                      },
                    })
                  }
                    className={`rounded px-2 py-1.5 text-xs font-medium transition ${
                      !isAllowed &&  element.finishing.lamination.type !== type
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
                  {['front', 'back', 'both'].map((side) => (
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
              {['none', 'half-fold', 'tri-fold', 'z-fold', 'gate-fold'].map((type) => {
                const isAllowed = config.allowedFoldTypes.includes(type);
                return (
                  <button
                    key={type}
                    disabled={!isAllowed}
                    onClick={() =>
                      onUpdate({
                        finishing: {
                          ...element.finishing,
                          folding: {
                            type,
                            folds: type === 'none' ? 0 : element.finishing.folding.folds || 1,
                          },
                        },
                      })
                    }
                    className={`rounded px-2 py-1.5 text-xs font-medium transition ${
                      !isAllowed &&  element.finishing.folding.type !== type
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
                onChange={(e) =>
                  onUpdate({
                    finishing: {
                      ...element.finishing,
                      creasing: { count: parseInt(e.target.value) },
                    },
                  })
                }
                className="flex-1 accent-blue-500 dark:accent-blue-400"
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
              {[0, 1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() =>
                    onUpdate({
                      finishing: {
                        ...element.finishing,
                        roundedCornes: { count },
                      },
                    })
                  }
                  className={`rounded px-2 py-1.5 text-xs font-medium transition ${
                    element.finishing.roundedCornes.count === count
                      ? 'bg-blue-500 dark:bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ PREVIEW CARD ============
function PreviewCard({ element }) {
  if (!element) return null;

  const roundCornerClass = {
    0: 'rounded-none',
    1: 'rounded-sm',
    2: 'rounded-md',
    3: 'rounded-lg',
    4: 'rounded-full',
  }[element.finishing.roundedCornes.count] || 'rounded-none';

  const laminationColor = {
    none: 'bg-white dark:bg-slate-700',
    gloss: 'bg-gradient-to-br from-white to-slate-100 dark:from-slate-600 dark:to-slate-700',
    matt: 'bg-slate-50 dark:bg-slate-700',
    'soft-touch': 'bg-slate-100 dark:bg-slate-600',
  }[element.finishing.lamination.type];

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm h-fit">
      <h3 className="mb-2.5 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Preview
      </h3>
      <div className="flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
        <div
          className={`flex flex-col items-center justify-center ${laminationColor} border-2 border-dashed border-slate-300 dark:border-slate-500 p-6 ${roundCornerClass}`}
          style={{
            aspectRatio: `${element.size.width} / ${element.size.height}`,
            maxWidth: '100%',
            width: '200px',
          }}
        >
          <div className="text-center">
            <div className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {element.label}
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-50">
              {element.size.width.toFixed(1)} × {element.size.height.toFixed(1)} {element.size.unit}
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              {element.paper.gsm} GSM • {element.paper.finish}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ASSEMBLY SUMMARY ============
function AssemblySummary({ product }) {
  if (!product) return null;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm h-fit">
      <h3 className="mb-2.5 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Assembly ({product.amount} unit{product.amount !== 1 ? 's' : ''})
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {product.elementals.map((element: Elemental, index: number) => (
          <div
            key={element.id}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 p-2.5"
          >
            <div className="font-semibold text-slate-900 dark:text-slate-50 text-xs mb-1.5">
              {index + 1}. {element.label}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600 dark:text-slate-400">
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-50">Paper:</span> {element.paper.label}
              </div>
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-50">Size:</span> {element.size.width.toFixed(1)}×{element.size.height.toFixed(1)} {element.size.unit}
              </div>
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-50">Lamination:</span>{' '}
                {element.finishing.lamination.type === 'none'
                  ? 'None'
                  : `${element.finishing.lamination.type}`}
              </div>
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-50">Fold:</span>{' '}
                {element.finishing.folding.type === 'none'
                  ? 'None'
                  : element.finishing.folding.type}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-950 p-2.5 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-900 dark:text-blue-200">
          <span className="font-semibold">Product: </span>
          {product.label} ({product.elementals.length} item{product.elementals.length !== 1 ? 's' : ''}) × {product.amount}
        </p>
      </div>
    </div>
  );
}
