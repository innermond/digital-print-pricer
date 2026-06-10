import { Badge } from './Badge';
import type { ProductCategory } from '../types';

type CategoryButtonProps = {
  category: ProductCategory;
  selectedCategoryId?: ProductCategory['id'];
  presetCount: number;
  onClick: () => void;
};

// ==== Category Button ===
export function CategoryButton({ category, selectedCategoryId, presetCount, onClick }: CategoryButtonProps) {
  const button = (
    <button
      onClick={onClick}
      className={`flex-grow flex-shrink rounded-lg border-2 px-4 py-3 text-left transition ${
        selectedCategoryId === category.id
          ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950'
          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
      }`}
    >
      <div className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
        {category.label}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {presetCount} variant{presetCount !== 1 ? 'e' : 'ă'}
        </div>
      </div>
    </button>
  );

  return category.explanation ? <Badge text={category.explanation}>{button}</Badge> : button;
}
