import type { Media, Pocket } from '../../types';

type PocketControlProps = {
  pocket: Pocket;
  media: Media[];
};

// Read-only counterpart to BindingControl: the pocket is a fixed accessory, so this
// states what is included rather than offering anything to pick.
export function PocketControl({ pocket, media }: PocketControlProps) {
  const paper = media.find((m) => m.id === pocket.mediaId);

  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2.5">
      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2 text-xs">Buzunar</h4>
      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
        {pocket.label} inclus
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {pocket.width} × {pocket.height} {pocket.unit}
      </p>
      {paper && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{paper.label}</p>
      )}
    </div>
  );
}
