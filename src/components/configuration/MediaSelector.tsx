import { useId } from 'react';
import type { Media, StickerFace } from '../../types';
import { Badge } from '../Badge';
import { optionCardClass } from '../../lib/optionButton';

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
  PVC: 'PVC',
};

function mediaSubLabel(m: Media): string {
  switch (m.kind) {
    case 'paper':   return `${m.gsm} GSM · ${m.finish}`;
    case 'sticker': return `Față ${FACE_RO[m.face] ?? m.face.toLowerCase()}`;
  }
}

export function MediaSelector({ media, selectedId, recommendedId, onSelect, badgeText }: MediaSelectorProps) {
  const headingId = useId();
  const widget = (
    <div role="group" aria-labelledby={headingId}>
      <h3 id={headingId} className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
        Material
      </h3>
      <div className="flex flex-wrap gap-2">
        {media.map((m) => {
          const btn = (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m)}
              aria-pressed={selectedId === m.id}
              className={`flex-1 min-w-28 relative ${optionCardClass({ active: selectedId === m.id })}`}
            >
              {recommendedId === m.id && (
                <span
                  className="absolute top-1 right-1 text-xs rounded px-1.5 py-0.5 font-medium"
                  title="Recomandat"
                >
                  ⭐
                </span>
              )}
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{m.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{mediaSubLabel(m)}</div>
            </button>
          );
          return m.explanation
            ? <Badge key={m.id} text={m.explanation} grow>{btn}</Badge>
            : btn;
        })}
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
