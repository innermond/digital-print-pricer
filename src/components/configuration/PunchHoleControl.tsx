import { optionButtonClass } from '../../lib/optionButton';

type PunchHoleControlProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

// The hanging hole punched through a bound product. It goes through the whole
// block rather than through one part, so it is a product-wide accessory next to
// the binding and the pocket — not a per-elemental finishing like `staple.hole`,
// which would draw one toggle per sheet of a calendar.
export function PunchHoleControl({ enabled, onChange }: PunchHoleControlProps) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Gaură de agățare</h4>
      <div className={enabled ? undefined : 'opacity-50'}>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
          Gaură {enabled ? 'inclusă' : 'exclusă'}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Perforare pentru agățare pe perete
        </p>
      </div>
      <button
        type="button"
        aria-pressed={enabled}
        onClick={() => onChange(!enabled)}
        className={`mt-2 ${optionButtonClass({ active: enabled })}`}
      >
        {enabled ? 'Inclusă' : 'Exclusă'}
      </button>
    </div>
  );
}
