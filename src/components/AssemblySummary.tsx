import type { Elemental, Product } from '../types';

const LAMINATION_RO: Record<string, string> = {
  none: 'Fără', gloss: 'Lucios', matt: 'Mat', 'soft-touch': 'Soft-touch',
};
const FOLD_RO: Record<string, string> = {
  none: 'Fără', 'half-fold': 'La jumătate', 'tri-fold': 'În trei', 'z-fold': 'Z', 'gate-fold': 'Poartă',
};
const SPIRAL_COLOR_RO: Record<string, string> = {
  white: 'Alb', black: 'Negru',
};

type AssemblySummaryProps = {
  product: Product | undefined;
  personalized?: boolean;
};

export function AssemblySummary({ product, personalized }: AssemblySummaryProps) {
  if (!product) return null;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm h-fit">
      <h3 className="mb-2.5 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Asamblare ({product.amount} {product.amount !== 1 ? 'unități' : 'unitate'})
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
          {product.label} ({product.elementals.length} {product.elementals.length !== 1 ? 'elemente' : 'element'}) × {product.amount}
        </p>
        {product.binding?.type === 'spiral' && (
          <p className="text-xs text-blue-900 dark:text-blue-200 mt-1">
            <span className="font-semibold">Spirală: </span>
            {SPIRAL_COLOR_RO[product.binding.color] ?? product.binding.color}
          </p>
        )}
      </div>
    </div>
  );
}
