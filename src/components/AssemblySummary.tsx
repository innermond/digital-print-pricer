import type { Elemental, Pocket, Product } from '../types';
import { LAMINATION_RO, FOLD_RO, SPIRAL_COLOR_RO, plural, describeProduct } from '../lib/labels';

type AssemblySummaryProps = {
  product: Product | undefined;
  personalized?: boolean;
  // Catalog-level accessory rather than an elemental, so it arrives alongside the
  // product instead of appearing in the loop below.
  pocket?: Pocket;
  // Already resolved against the config by the caller: true only when the product
  // offers a hole and this instance keeps it.
  punchHole?: boolean;
};

export function AssemblySummary({ product, personalized, pocket, punchHole }: AssemblySummaryProps) {
  if (!product) return null;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm h-fit">
      <h3 className="mb-2.5 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Asamblare ({plural(product.amount, 'unitate', 'unități')})
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
                <span className="font-medium text-slate-900 dark:text-slate-50">Material:</span> {element.media.label}
              </div>
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-50">Dimensiune:</span> {element.size.width.toFixed(1)}×{element.size.height.toFixed(1)} {element.size.unit}
              </div>
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-50">Pagini:</span> {element.pageCount}
              </div>
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-50">Laminare:</span>{' '}
                {LAMINATION_RO[element.finishing.lamination.type] ?? element.finishing.lamination.type}
              </div>
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-50">Pliere:</span>{' '}
                {FOLD_RO[element.finishing.folding.type] ?? element.finishing.folding.type}
              </div>
              {element.finishing.staple && (element.finishing.staple.hole || element.finishing.staple.staple) && (
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-50">Capsare:</span>{' '}
                  {[
                    element.finishing.staple.hole && 'Gaură',
                    element.finishing.staple.staple && 'Capsă',
                  ].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-950 p-2.5 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-900 dark:text-blue-200">
          <span className="font-semibold">{personalized ? 'Produs personalizat' : 'Produs'}: </span>
          {/* The catalog label names the preset, not what was configured — once the
              product diverges it would read "A5, 16 Pagini" over an A4 24-page job. */}
          {personalized ? describeProduct(product) : product.label}{' '}
          ({plural(product.elementals.length, 'element', 'elemente')}) × {product.amount}
        </p>
        {product.binding?.type === 'spiral' && (
          <p className="text-xs text-blue-900 dark:text-blue-200 mt-1">
            <span className="font-semibold">Spirală: </span>
            {SPIRAL_COLOR_RO[product.binding.color] ?? product.binding.color}
          </p>
        )}
        {pocket && (
          <p className="text-xs text-blue-900 dark:text-blue-200 mt-1">
            <span className="font-semibold">Buzunar: </span>
            {pocket.label} ({pocket.width} × {pocket.height} {pocket.unit})
          </p>
        )}
        {punchHole && (
          <p className="text-xs text-blue-900 dark:text-blue-200 mt-1">
            <span className="font-semibold">Gaură de agățare: </span>
            Inclusă
          </p>
        )}
      </div>
    </div>
  );
}
