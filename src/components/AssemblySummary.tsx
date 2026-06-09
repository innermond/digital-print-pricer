import type { Elemental, Product } from '../types';

type AssemblySummaryProps = {
  product: Product | undefined;
};

// ============ ASSEMBLY SUMMARY ============
export function AssemblySummary({ product }: AssemblySummaryProps) {
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
                <span className="font-medium text-slate-900 dark:text-slate-50">Media:</span> {element.media.label}
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
