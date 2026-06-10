import type { Printing, PrintInk } from '../../types';
import { Badge } from '../Badge';

const FRONT_INK_INFO: Record<PrintInk | 'none', { label: string; explanation: string }> = {
  color: { label: 'Color',      explanation: 'Tipărire CMYK completă pe fața față. Potrivit pentru fotografii, ilustrații și design-uri cu identitate vizuală puternică.' },
  black: { label: 'Alb-negru',  explanation: 'Tipărire monocromă (cerneală neagră) pe fața față. Cost mai mic — potrivit pentru documente cu mult text unde culoarea nu este necesară.' },
  none:  { label: 'Neimprimat', explanation: 'Fața față rămâne netipărită.' },
};

const BACK_INK_INFO: Record<PrintInk | 'none', { label: string; explanation: string }> = {
  color: { label: 'Color',      explanation: 'Tipărire CMYK completă pe fața verso.' },
  black: { label: 'Alb-negru',  explanation: 'Tipărire monocromă (cerneală neagră) pe fața verso. Util când versoul conține text sau grafice simple.' },
  none:  { label: 'Neimprimat', explanation: 'Fața verso rămâne netipărită. Mai ieftin și mai rapid — potrivit când doar o față trebuie să comunice.' },
};

const FRONT_INKS = Object.keys(FRONT_INK_INFO) as Array<PrintInk | 'none'>;
const BACK_INKS = Object.keys(BACK_INK_INFO) as Array<PrintInk | 'none'>;
const DEFAULT_FRONTS: Array<PrintInk | 'none'> = ['color', 'black'];

type PrintingControlProps = {
  printing: Printing;
  onChange: (printing: Printing) => void;
  allowedFronts?: Array<PrintInk | 'none'>;
  allowedBacks?: Array<PrintInk | 'none'>;
  badgeText?: string;
};

export function PrintingControl({ printing, onChange, allowedFronts, allowedBacks, badgeText }: PrintingControlProps) {
  const btnClass = (active: boolean) =>
    `whitespace-nowrap rounded px-2 py-1 text-xs font-medium transition ${
      active
        ? 'bg-blue-500 dark:bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400'
    }`;

  const visibleFronts = FRONT_INKS.filter((ink) => (allowedFronts ?? DEFAULT_FRONTS).includes(ink));
  const visibleBacks = allowedBacks
    ? BACK_INKS.filter((ink) => allowedBacks.includes(ink))
    : BACK_INKS;
  const showFront = visibleFronts.length > 0;
  const showBack = visibleBacks.length > 0;

  if (!showFront && !showBack) return null;

  const widget = (
    <div>
      <label className="block text-xs font-semibold text-slate-900 dark:text-slate-50 mb-2">
        Tipărire
      </label>
      <div className="flex flex-wrap items-start gap-2">
        {showFront && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2">
            <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1.5 text-xs">Față</h4>
            <div className="flex flex-wrap gap-1.5">
              {visibleFronts.map((ink) => {
                const { label, explanation } = FRONT_INK_INFO[ink];
                const btn = (
                  <button
                    key={ink}
                    onClick={() => onChange({ ...printing, front: ink })}
                    className={btnClass(printing.front === ink)}
                  >
                    {label}
                  </button>
                );
                return <Badge key={ink} text={explanation}>{btn}</Badge>;
              })}
            </div>
          </div>
        )}

        {showBack && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2">
            <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-1.5 text-xs">Verso</h4>
            <div className="flex flex-wrap gap-1.5">
              {visibleBacks.map((ink) => {
                const { label, explanation } = BACK_INK_INFO[ink];
                const btn = (
                  <button
                    key={ink}
                    onClick={() => onChange({ ...printing, back: ink })}
                    className={btnClass(printing.back === ink)}
                  >
                    {label}
                  </button>
                );
                return <Badge key={ink} text={explanation}>{btn}</Badge>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
