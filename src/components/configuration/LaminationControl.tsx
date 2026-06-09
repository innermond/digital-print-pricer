import type { LaminationType, LaminationSides, Finishing } from '../../types';
import { Badge } from '../Badge';

const LAMINATION_TYPE_INFO: Record<LaminationType, { label: string; explanation?: string }> = {
  none:         { label: 'None', explanation: 'No lamination applied. The paper surface is left as-is.' },
  gloss:        { label: 'Gloss', explanation: 'High-shine coating that makes colours vibrant and images pop. Susceptible to fingerprints and glare under bright light.' },
  matt:         { label: 'Matt', explanation: 'Low-sheen coating that reduces glare and gives a refined, understated look. Easier to write on than gloss.' },
  'soft-touch': { label: 'Soft-touch', explanation: 'Velvety tactile laminate that feels luxurious to the touch. Most expensive option — best reserved for premium pieces.' },
};

const LAMINATION_SIDE_INFO: Record<LaminationSides, { label: string; explanation?: string }> = {
  front: { label: 'Front', explanation: 'Laminate only the front (printed) face.' },
  back:  { label: 'Back',  explanation: 'Laminate only the reverse side.' },
  both:  { label: 'Both',  explanation: 'Laminate both sides for maximum durability and a consistent feel.' },
};

const LAMINATION_TYPES = Object.keys(LAMINATION_TYPE_INFO) as LaminationType[];
const LAMINATION_SIDES = Object.keys(LAMINATION_SIDE_INFO) as LaminationSides[];

type LaminationControlProps = {
  lamination: Finishing['lamination'];
  allowedTypes: LaminationType[];
  onChange: (lamination: Finishing['lamination']) => void;
  badgeText?: string;
};

export function LaminationControl({ lamination, allowedTypes, onChange, badgeText }: LaminationControlProps) {
  const widget = (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Lamination</h4>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {LAMINATION_TYPES.map((type) => {
          const allowed = allowedTypes.includes(type);
          const { label, explanation } = LAMINATION_TYPE_INFO[type];
          const btn = (
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
              {label}
            </button>
          );
          return explanation
            ? <Badge key={type} text={explanation}>{btn}</Badge>
            : btn;
        })}
      </div>
      {lamination.type !== 'none' && (
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
            Apply to:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LAMINATION_SIDES.map((side) => {
              const { label, explanation } = LAMINATION_SIDE_INFO[side];
              const btn = (
                <button
                  key={side}
                  onClick={() => onChange({ ...lamination, sides: side })}
                  className={`flex-1 rounded px-2 py-1 text-xs font-medium transition ${
                    lamination.sides === side
                      ? 'bg-blue-500 dark:bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500'
                  }`}
                >
                  {label}
                </button>
              );
              return explanation
                ? <Badge key={side} text={explanation}>{btn}</Badge>
                : btn;
            })}
          </div>
        </div>
      )}
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
