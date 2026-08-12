import { useId } from 'react';
import type { LaminationType, LaminationSides, Finishing } from '../../types';
import { Badge } from '../Badge';
import { optionButtonClass } from '../../lib/optionButton';

const LAMINATION_TYPE_INFO: Record<LaminationType, { label: string; explanation?: string }> = {
  none:         { label: 'Fără',       explanation: 'Fără laminare. Suprafața hârtiei rămâne nemodificată.' },
  gloss:        { label: 'Lucios',     explanation: 'Strat de luciu puternic care face culorile vibrante și imaginile atrăgătoare. Susceptibil la amprente și reflexii sub lumină puternică.' },
  matt:         { label: 'Mat',        explanation: 'Strat cu luciu redus care elimină reflexiile și dă un aspect rafinat, discret. Poate fi scris mai ușor decât luciosul.' },
  'soft-touch': { label: 'Soft-touch', explanation: 'Laminare catifelată cu senzație tactilă deosebită. Cea mai scumpă opțiune — rezervată pentru materiale de prezentare premium.' },
};

const LAMINATION_SIDE_INFO: Record<LaminationSides, { label: string; explanation?: string }> = {
  front: { label: 'Față',    explanation: 'Laminare doar pe fața față (tipărită).' },
  back:  { label: 'Spate',   explanation: 'Laminare doar pe fața verso.' },
  both:  { label: 'Ambele',  explanation: 'Laminare pe ambele fețe pentru durabilitate maximă și aspect consistent.' },
};

const LAMINATION_TYPES = Object.keys(LAMINATION_TYPE_INFO) as LaminationType[];
const LAMINATION_SIDES = Object.keys(LAMINATION_SIDE_INFO) as LaminationSides[];

type LaminationControlProps = {
  lamination: Finishing['lamination'];
  allowedTypes: LaminationType[];
  allowedSides: LaminationSides[];
  onChange: (lamination: Finishing['lamination']) => void;
  badgeText?: string;
};

export function LaminationControl({ lamination, allowedTypes, allowedSides, onChange, badgeText }: LaminationControlProps) {
  const headingId = useId();
  const sidesId = useId();
  const widget = (
    <div role="group" aria-labelledby={headingId} className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
      <h4 id={headingId} className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Laminare</h4>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex flex-wrap gap-1.5">
          {LAMINATION_TYPES.map((type) => {
            const allowed = type === 'none' || allowedTypes.includes(type);
            const { label, explanation } = LAMINATION_TYPE_INFO[type];
            const btn = (
              <button
                key={type}
                type="button"
                aria-pressed={lamination.type === type}
                onClick={() => {
                  if (!allowed) return;
                  onChange({ ...lamination, type });
                }}
                className={`whitespace-nowrap ${optionButtonClass({
                  active: lamination.type === type,
                  disabled: !allowed && lamination.type !== type,
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
        {lamination.type !== 'none' && (
          <div className="flex items-center gap-1.5">
            <span id={sidesId} className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Aplică pe:
            </span>
            <div role="group" aria-labelledby={sidesId} className="flex flex-wrap gap-1.5">
              {LAMINATION_SIDES.map((side) => {
                const allowed = allowedSides.includes(side);
                const { label, explanation } = LAMINATION_SIDE_INFO[side];
                const btn = (
                  <button
                    key={side}
                    type="button"
                    aria-pressed={lamination.sides === side}
                    onClick={() => {
                      if (!allowed) return;
                      onChange({ ...lamination, sides: side });
                    }}
                    className={`whitespace-nowrap ${optionButtonClass({
                      active: lamination.sides === side,
                      disabled: !allowed && lamination.sides !== side,
                    })}`}
                  >
                    {label}
                  </button>
                );
                return explanation && allowed
                  ? <Badge key={side} text={explanation}>{btn}</Badge>
                  : btn;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
