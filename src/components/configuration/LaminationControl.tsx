import type { LaminationType, LaminationSides, Finishing } from '../../types';

const LAMINATION_TYPES: LaminationType[] = ['none', 'gloss', 'matt', 'soft-touch'];
const LAMINATION_SIDES: LaminationSides[] = ['front', 'back', 'both'];

type LaminationControlProps = {
  lamination: Finishing['lamination'];
  allowedTypes: LaminationType[];
  onChange: (lamination: Finishing['lamination']) => void;
};

export function LaminationControl({ lamination, allowedTypes, onChange }: LaminationControlProps) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Lamination</h4>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {LAMINATION_TYPES.map((type) => {
          const allowed = allowedTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => {
                if (!allowed) return;
                onChange({ ...lamination, type });
              }}
              className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
                !allowed && lamination.type !== type
                  ? 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : lamination.type === type
                  ? 'bg-blue-500 dark:bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          );
        })}
      </div>
      {lamination.type !== 'none' && (
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
            Apply to:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LAMINATION_SIDES.map((side) => (
              <button
                key={side}
                onClick={() => onChange({ ...lamination, sides: side })}
                className={`flex-1 rounded px-2 py-1 text-xs font-medium transition ${
                  lamination.sides === side
                    ? 'bg-blue-500 dark:bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500'
                }`}
              >
                {side.charAt(0).toUpperCase() + side.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
