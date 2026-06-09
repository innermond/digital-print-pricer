import type { Elemental, LaminationType, RoundedCorner } from '../types';

const ALL_LAMINATION_TYPES: LaminationType[] = ['none', 'gloss', 'matt', 'soft-touch'];
const ALL_CREASING_COUNTS = [0, 1, 2, 3, 4, 5];
const ALL_ROUNDED_CORNERS: RoundedCorner[] = [1, 2, 3, 4];

export const allowedLaminationTypes = (elem: Elemental): LaminationType[] => {
  if (['elem3-2'].includes(elem.id)) return [];
  switch (elem.media.kind) {
    case 'sticker': return ALL_LAMINATION_TYPES;
    case 'paper':   return elem.media.gsm < 170 ? [] : ALL_LAMINATION_TYPES;
  }
};

export const allowedCreasingCounts = (elem: Elemental): number[] => {
  if (['elem4-1', 'elem3-2'].includes(elem.id)) return [];
  switch (elem.media.kind) {
    case 'sticker': return [];
    case 'paper':   return elem.media.gsm < 200 ? [] : ALL_CREASING_COUNTS;
  }
};

export const allowedRoundedCorners = (elem: Elemental): RoundedCorner[] => {
  if (['elem3-1', 'elem3-2'].includes(elem.id)) return [];
  switch (elem.media.kind) {
    case 'sticker': return ALL_ROUNDED_CORNERS;
    case 'paper':   return elem.media.gsm < 170 ? [] : ALL_ROUNDED_CORNERS;
  }
};
