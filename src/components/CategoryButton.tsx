import { Badge } from './Badge';
import type { ProductCategory } from '../types';
import { optionCardClass } from '../lib/optionButton';
import { plural } from '../lib/labels';

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
      type="button"
      onClick={onClick}
      aria-pressed={selectedCategoryId === category.id}
      className={`flex-grow flex-shrink px-4 py-3 ${optionCardClass({ active: selectedCategoryId === category.id })}`}
    >
      <div className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
        {category.label}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {plural(presetCount, 'variantă', 'variante')}
        </div>
      </div>
    </button>
  );

  return category.explanation ? <Badge text={category.explanation}>{button}</Badge> : button;
}
