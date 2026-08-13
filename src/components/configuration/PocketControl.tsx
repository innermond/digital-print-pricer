import type { Media, Pocket } from '../../types';
import { optionButtonClass } from '../../lib/optionButton';

type PocketControlProps = {
  pocket: Pocket;
  media: Media[];
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function PocketControl({ pocket, media, enabled, onChange }: PocketControlProps) {
  const paper = media.find((m) => m.id === pocket.mediaId);

  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Buzunar</h4>
      <div className={enabled ? undefined : 'opacity-50'}>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
          {pocket.label} {enabled ? 'inclus' : 'exclus'}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {pocket.width} × {pocket.height} {pocket.unit}
        </p>
        {paper && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{paper.label}</p>
        )}
      </div>
      <button
        type="button"
        aria-pressed={enabled}
        onClick={() => onChange(!enabled)}
        className={`mt-2 ${optionButtonClass({ active: enabled })}`}
      >
        {enabled ? 'Inclus' : 'Exclus'}
      </button>
    </div>
  );
}
