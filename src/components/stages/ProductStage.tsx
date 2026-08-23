import type { Product, ProductCategory } from '../../types';
import type { Catalog } from '../../data/catalog';
import { CategoryButton } from '../CategoryButton';
import { ProductButton } from '../ProductButton';

type ProductStageProps = {
  catalog: Catalog;
  products: Product[];
  selectedCategoryId: ProductCategory['id'] | null;
  selectedProductId: Product['id'];
  // When the host preselected a category, it is fixed: the user picks a product
  // within it but can't navigate back to the category list.
  categoryLocked: boolean;
  onSelectCategory: (categoryId: ProductCategory['id'] | null) => void;
  onSelectProduct: (product: Product) => void;
  // Double-click: select the product and advance to Configurare in one step.
  onConfirmProduct: (product: Product) => void;
  isPersonalized: (product: Product) => boolean;
  onRevert: (productId: Product['id']) => void;
};

// Two-phase drill-down: the category grid, then the products within it.
export function ProductStage({
  catalog,
  products,
  selectedCategoryId,
  selectedProductId,
  categoryLocked,
  onSelectCategory,
  onSelectProduct,
  onConfirmProduct,
  isPersonalized,
  onRevert,
}: ProductStageProps) {
  return (
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
                onClick={() => onSelectCategory(category.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-3">
            {!categoryLocked && (
              <button
                onClick={() => onSelectCategory(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition"
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
                  onClick={() => onSelectProduct(product)}
                  onDoubleClick={() => onConfirmProduct(product)}
                  badgeText={catalog.config[product.id]?.explanation}
                  personalized={isPersonalized(product)}
                  onRevert={() => onRevert(product.id)}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}
