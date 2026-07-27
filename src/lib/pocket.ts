import type { Elemental, Media, Pocket } from '../types';
import { convertSize } from './sizeUtils';

// Rebuild the pocket as an Elemental. It is never stored — the pocket is catalog
// data, not state — but the price payload has always described it as one, so it is
// synthesized at the point of use to keep that contract intact.
export const pocketElemental = (pocket: Pocket, media: Media[]): Elemental | null => {
  const paper = media.find((m) => m.id === pocket.mediaId);
  if (!paper) return null;

  return {
    id: 'pocket',
    label: pocket.label,
    media: paper,
    size: {
      id: 's999',
      label: 'Pers.',
      width: pocket.width,
      height: pocket.height,
      unit: pocket.unit,
      widthMm: convertSize(pocket.width, pocket.unit, 'mm'),
      heightMm: convertSize(pocket.height, pocket.unit, 'mm'),
    },
    pageCount: pocket.pageCount,
    printing: pocket.printing,
    finishing: {
      lamination: { type: 'none', sides: 'front' },
      folding: { type: 'none', folds: 0 },
      creasing: { count: 0 },
      roundedCornes: { corners: [] },
    },
  };
};
