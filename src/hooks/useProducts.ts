import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type { Product, Elemental, Binding } from '../types';
import type { Catalog } from '../data/catalog';
import { clampLamination } from '../lib/finishingRules';
import { isPersonalized as isPersonalizedAgainst } from '../lib/personalization';

// v3: the folder pocket stopped being an Elemental and prod3b was retired, so a
// v2 cache would resurrect both. The persisted Product[] shape has not changed
// since — do not bump this without a real shape change, it wipes local edits.
const STORAGE_VERSION = 'v3';

type UseProductsOptions = {
  catalog: Catalog;
  // Only standalone dev persists edits. A host-injected catalog is the source of
  // truth and must never be written into a staff member's browser, so the root
  // decides this by identity (catalog === MOCK_CATALOG) rather than the hook
  // re-deriving it.
  persist: boolean;
};

// Owns the editable product list: the catalog defaults plus whatever the user
// has changed, along with persistence and the import/export/reset tools.
export function useProducts({ catalog, persist }: UseProductsOptions) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (!persist) return catalog.products;
    const saved = localStorage.getItem('products');
    const version = localStorage.getItem('products_version');
    if (saved && version === STORAGE_VERSION) return JSON.parse(saved) as Product[];
    localStorage.setItem('products_version', STORAGE_VERSION);
    return catalog.products;
  });

  useEffect(() => {
    if (!persist) return;
    localStorage.setItem('products', JSON.stringify(products));
  }, [products, persist]);

  const updateElemental = (elementId: Elemental['id'], updates: Partial<Elemental>) => {
    setProducts(prev =>
      prev.map((product: Product) => ({
        ...product,
        elementals: product.elementals.map((elem) =>
          elem.id === elementId
            ? clampLamination({ ...elem, ...updates }, catalog.config[product.id])
            : elem
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

  const baselineProduct = (id: Product['id']) => catalog.products.find(p => p.id === id);
  const isPersonalized = (p: Product) => isPersonalizedAgainst(p, baselineProduct(p.id));

  // Restore a product's elementals/binding to the catalog defaults.
  const revertProduct = (id: Product['id']) => {
    const base = baselineProduct(id);
    if (!base) return;
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, elementals: base.elementals, binding: base.binding } : p))
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

  const importProducts = (e: ChangeEvent<HTMLInputElement>, onImported: (products: Product[]) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      let imported: Product[];
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') throw new Error('Conținut fișier invalid');
        imported = JSON.parse(text) as Product[];
      } catch (err) {
        console.log(err);
        alert('Fișier JSON nevalid');
        return;
      }
      // Parsed fine but has nothing in it — distinct from malformed JSON, which
      // the old single try/catch reported for both cases.
      if (!Array.isArray(imported) || imported.length === 0) {
        alert('Fișierul nu conține niciun produs');
        return;
      }
      setProducts(imported);
      onImported(imported);
    };
    reader.readAsText(file);
  };

  const resetProducts = (onReset: () => void) => {
    if (confirm('Resetați produsele la valorile implicite?')) {
      setProducts(catalog.products);
      onReset();
    }
  };

  return {
    products,
    updateElemental,
    updateBinding,
    setProductSize,
    updateProductAmount,
    setProductAmount,
    isPersonalized,
    revertProduct,
    exportProducts,
    importProducts,
    resetProducts,
  };
}
