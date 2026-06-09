import type { FoldingType, Finishing } from '../../types';
import { Badge } from '../Badge';

const FOLDING_TYPE_INFO: Partial<Record<FoldingType, { label: string; explanation?: string }>> = {
  none:        { label: 'Fără',              explanation: 'Fără pliere. Livrat plat.' },
  'half-fold': { label: 'Pliere la jumătate', explanation: 'O pliere centrală care creează două panouri egale. Clasic pentru pliante A4→A5.' },
  'tri-fold':  { label: 'Pliere în trei',    explanation: 'Două pliuri paralele care împart coala în trei panouri egale. Standard pentru broșuri DL.' },
  'z-fold':    { label: 'Pliere Z',          explanation: 'Două pliuri în direcții opuse, formând o formă Z sau S. Fiecare panou este vizibil când se desfășoară — potrivit pentru hărți și meniuri.' },
  'gate-fold': { label: 'Pliere poartă',     explanation: 'Două panouri exterioare se pliază înăuntru, ca o pereche de uși. Efect de dezvăluire dramatic pentru materiale premium.' },
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
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Pliere</h4>
      <div className="flex flex-wrap gap-1.5">
        {FOLDING_TYPES.map((type) => {
          const allowed = allowedFoldTypes.includes(type) || (type === 'none' && allowedFoldTypes.length === 0);
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
          return explanation && allowed
            ? <Badge key={type} text={explanation}>{btn}</Badge>
            : btn;
        })}
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
