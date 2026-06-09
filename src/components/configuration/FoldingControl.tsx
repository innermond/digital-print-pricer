import type { FoldingType, Finishing } from '../../types';
import { Badge } from '../Badge';

const FOLDING_TYPE_INFO: Partial<Record<FoldingType, { label: string; explanation?: string }>> = {
  none:       { label: 'None',      explanation: 'No folding. Delivered flat.' },
  'half-fold':{ label: 'Half fold', explanation: 'One fold down the centre, creating two equal panels. Classic for A4→A5 leaflets.' },
  'tri-fold': { label: 'Tri-fold',  explanation: 'Two parallel folds that divide the sheet into three equal panels. The standard for DL brochures and letter-fold mailers.' },
  'z-fold':   { label: 'Z-fold',    explanation: 'Two folds in opposite directions, forming a Z or S shape. Each panel is fully visible when unfolded — good for maps and menus.' },
  'gate-fold':{ label: 'Gate fold', explanation: 'Two outer panels fold inward to meet at the centre without overlapping, like a pair of doors. Creates a dramatic reveal for premium brochures.' },
};

const FOLDING_TYPES = Object.keys(FOLDING_TYPE_INFO) as FoldingType[];

type FoldingControlProps = {
  folding: Finishing['folding'];
  allowedFoldTypes: string[];
  onChange: (folding: Finishing['folding']) => void;
  badgeText?: string;
};

export function FoldingControl({ folding, allowedFoldTypes, onChange, badgeText }: FoldingControlProps) {
  const widget = (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Folding</h4>
      <div className="flex flex-wrap gap-1.5">
        {FOLDING_TYPES.map((type) => {
          const allowed = allowedFoldTypes.includes(type);
          const { label, explanation } = FOLDING_TYPE_INFO[type]!;
          const btn = (
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
              {label}
            </button>
          );
          return explanation
            ? <Badge key={type} text={explanation}>{btn}</Badge>
            : btn;
        })}
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
