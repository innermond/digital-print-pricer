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

// Shown instead of the fold's own description when the press is what rules it
// out, so the button explains itself rather than just going grey.
const TOO_BIG_UNFOLDED = 'Desfăcut, formatul depășește limita presei. Alege o dimensiune mai mică.';

type FoldingControlProps = {
  folding: Finishing['folding'];
  allowedFoldTypes: string[];
  onChange: (folding: Finishing['folding']) => void;
  // Whether the sheet this fold opens out to still fits the press. Omit where
  // there is no press to answer for.
  foldFits?: (type: FoldingType) => boolean;
  badgeText?: string;
};

export function FoldingControl({ folding, allowedFoldTypes, onChange, foldFits, badgeText }: FoldingControlProps) {
  const headingId = useId();
  const widget = (
    <div role="group" aria-labelledby={headingId} className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
      <h4 id={headingId} className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Pliere</h4>
      <div className="flex flex-wrap gap-1.5">
        {FOLDING_TYPES.map((type) => {
          const offered = allowedFoldTypes.includes(type) || (type === 'none' && allowedFoldTypes.length === 0);
          const fits = foldFits?.(type) ?? true;
          // The current selection stays clickable whatever the press says: a
          // choice restored from an old cache must be one you can change away
          // from, not one that pins the control shut.
          const allowed = (offered && fits) || folding.type === type;
          const { label, explanation } = FOLDING_TYPE_INFO[type]!;
          // Why it is off matters more than what it would have done.
          const hint = offered && !fits ? TOO_BIG_UNFOLDED : explanation;
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
          return hint && (allowed || (offered && !fits))
            ? <Badge key={type} text={hint}>{btn}</Badge>
            : btn;
        })}
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
