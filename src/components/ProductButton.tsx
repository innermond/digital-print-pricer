import { Badge } from './Badge';
import type { Product } from '../types';

type ProductButtonProps = {
  product: Product;
  selectedProductId: Product['id'];
  badgeText?: string;
  onClick: () => void;
};

// ==== Product Button ===
export function ProductButton({product, selectedProductId, onClick, badgeText}: ProductButtonProps) {
  const button = (<button
  onClick={onClick}
  className={`flex-grow flex-shrink rounded-lg border-2 px-4 py-3 text-left transition ${
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
</button>);

  return badgeText ? <Badge text={badgeText}>{button}</Badge> : button;
}
