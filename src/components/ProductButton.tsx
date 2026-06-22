import { Badge } from './Badge';
import { RotateCcw } from 'lucide-react';
import type { Product } from '../types';

type ProductButtonProps = {
  product: Product;
  selectedProductId: Product['id'];
  badgeText?: string;
  // Set when the product's settings diverge from the catalog defaults.
  personalized?: boolean;
  onClick: () => void;
  // Revert the product to its initial settings (shown only when personalized).
  onRevert?: () => void;
};

// ==== Product Button ===
export function ProductButton({product, selectedProductId, onClick, badgeText, personalized, onRevert}: ProductButtonProps) {
  const card = (
    <span className="relative inline-flex flex-grow flex-shrink">
      <button
        onClick={onClick}
        className={`w-full rounded-lg border-2 px-4 py-3 text-left transition ${
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
      {/* Rendered as a sibling (not nested in the button) so clicking it reverts
          rather than selecting the product. */}
      {personalized && (
        <button
          onClick={() => onRevert?.()}
          title="Revine la setările inițiale"
          className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition"
        >
          <RotateCcw size={10} />
          personalizat
        </button>
      )}
    </span>
  );

  return badgeText ? <Badge text={badgeText}>{card}</Badge> : card;
}
