import type { FoldingType, Finishing } from '../../types';

const FOLDING_TYPES: FoldingType[] = ['none', 'half-fold', 'tri-fold', 'z-fold', 'gate-fold'];

type FoldingControlProps = {
  folding: Finishing['folding'];
  allowedFoldTypes: string[];
  onChange: (folding: Finishing['folding']) => void;
};

export function FoldingControl({ folding, allowedFoldTypes, onChange }: FoldingControlProps) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Folding</h4>
      <div className="flex flex-wrap gap-1.5">
        {FOLDING_TYPES.map((type) => {
          const allowed = allowedFoldTypes.includes(type);
          return (
            <button
              key={type}
              disabled={!allowed}
              onClick={() => {
                if (!allowed) return;
                onChange({
                  type,
                  folds: type === 'none' ? 0 : folding.folds || 1,
                });
              }}
              className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
                !allowed && folding.type !== type
                  ? 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : folding.type === type
                  ? 'bg-blue-500 dark:bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400'
              }`}
            >
              {type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
