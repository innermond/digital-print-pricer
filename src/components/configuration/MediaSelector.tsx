import type { Media, StickerFace } from '../../types';
import { Badge } from '../Badge';

type MediaSelectorProps = {
  media: Media[];
  selectedId: string;
  recommendedId: string;
  onSelect: (media: Media) => void;
  badgeText?: string;
};

const FACE_RO: Record<StickerFace, string> = {
  Gloss: 'lucioasă',
  Matt:  'mată',
  Clear: 'transparentă',
  Kraft: 'kraft',
};

function mediaSubLabel(m: Media): string {
  switch (m.kind) {
    case 'paper':   return `${m.gsm} GSM · ${m.finish}`;
    case 'sticker': return `Față ${FACE_RO[m.face] ?? m.face.toLowerCase()}`;
  }
}

export function MediaSelector({ media, selectedId, recommendedId, onSelect, badgeText }: MediaSelectorProps) {
  const widget = (
    <div>
      <label className="block text-xs font-semibold text-slate-900 dark:text-slate-50 mb-2">
        Material
      </label>
      <div className="flex flex-wrap gap-2">
        {media.map((m) => {
          const btn = (
            <button
              key={m.id}
              onClick={() => onSelect(m)}
              className={`flex-1 min-w-28 rounded-lg border-2 px-2.5 py-2 text-left transition text-xs relative ${
                selectedId === m.id
                  ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {recommendedId === m.id && (
                <span className="absolute top-1 right-1 bg-amber-500 text-white text-xs rounded px-1.5 py-0.5 font-medium">
                  ⭐
                </span>
              )}
              <div className="font-medium text-slate-900 dark:text-slate-50">{m.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{mediaSubLabel(m)}</div>
            </button>
          );
          return m.explanation
            ? <Badge key={m.id} text={m.explanation}>{btn}</Badge>
            : btn;
        })}
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
