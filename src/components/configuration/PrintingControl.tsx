import type { Printing, PrintInk } from '../../types';
import { Badge } from '../Badge';

const FRONT_INK_INFO: Record<PrintInk, { label: string; explanation: string }> = {
  color: { label: 'Color',      explanation: 'Full CMYK colour printing on the front face. Best for photos, illustrations, and brand-heavy designs.' },
  black: { label: 'Black only', explanation: 'Single-colour (black ink) on the front face. Lower cost — good for text-heavy documents where colour is not needed.' },
};

const BACK_INK_INFO: Record<PrintInk | 'none', { label: string; explanation: string }> = {
  color: { label: 'Color',      explanation: 'Full CMYK colour printing on the back face.' },
  black: { label: 'Black only', explanation: 'Single-colour (black ink) on the back face. Useful when the back carries text or simple graphics.' },
  none:  { label: 'Blank',      explanation: 'Back face is left unprinted. Cheaper and faster — suitable when only one side needs to communicate.' },
};

const FRONT_INKS = Object.keys(FRONT_INK_INFO) as PrintInk[];
const BACK_INKS = Object.keys(BACK_INK_INFO) as (PrintInk | 'none')[];

type PrintingControlProps = {
  printing: Printing;
  onChange: (printing: Printing) => void;
  allowedBacks?: Array<PrintInk | 'none'>;
  badgeText?: string;
};

export function PrintingControl({ printing, onChange, allowedBacks, badgeText }: PrintingControlProps) {
  const btnClass = (active: boolean) =>
    `flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
      active
        ? 'bg-blue-500 dark:bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400'
    }`;

  const visibleBacks = allowedBacks
    ? BACK_INKS.filter((ink) => allowedBacks.includes(ink))
    : BACK_INKS;
  const showBack = !(visibleBacks.length === 1 && visibleBacks[0] === 'none');

  const widget = (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Printing</h4>

      <div className="space-y-2">
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Front</label>
          <div className="flex flex-wrap gap-1.5">
            {FRONT_INKS.map((ink) => {
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

        {showBack && (
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Back</label>
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
