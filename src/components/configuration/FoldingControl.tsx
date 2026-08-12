import { useId } from 'react';
import type { FoldingType, Finishing } from '../../types';
import { Badge } from '../Badge';
import { optionButtonClass } from '../../lib/optionButton';

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
  const headingId = useId();
  const widget = (
    <div role="group" aria-labelledby={headingId} className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
      <h4 id={headingId} className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Pliere</h4>
      <div className="flex flex-wrap gap-1.5">
        {FOLDING_TYPES.map((type) => {
          const allowed = allowedFoldTypes.includes(type) || (type === 'none' && allowedFoldTypes.length === 0);
          const { label, explanation } = FOLDING_TYPE_INFO[type]!;
          const btn = (
            <button
              key={type}
              type="button"
              aria-pressed={folding.type === type}
              disabled={!allowed}
              onClick={() => {
                if (!allowed) return;
                onChange({
                  type,
                  folds: type === 'none' ? 0 : folding.folds || 1,
                });
              }}
              className={`whitespace-nowrap ${optionButtonClass({
                active: folding.type === type,
                disabled: !allowed && folding.type !== type,
              })}`}
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
