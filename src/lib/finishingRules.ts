import type { Elemental, LaminationType, RoundedCorner } from '../types';

const ALL_LAMINATION_TYPES: LaminationType[] = ['none', 'gloss', 'matt', 'soft-touch'];
const ALL_CREASING_COUNTS = [0, 1, 2, 3, 4, 5];
const ALL_ROUNDED_CORNERS: RoundedCorner[] = [1, 2, 3, 4];

const isLabelStock = (elem: Elemental): boolean =>
  elem.paper.finish.startsWith('Sticker-');

export const allowedLaminationTypes = (elem: Elemental): LaminationType[] => {
  if (['elem3-2'].includes(elem.id)) return [];
  if (isLabelStock(elem)) return ALL_LAMINATION_TYPES;
  if (elem.paper.gsm < 170) return [];
  return ALL_LAMINATION_TYPES;
};

export const allowedCreasingCounts = (elem: Elemental): number[] => {
  if (isLabelStock(elem)) return [];
  if (elem.paper.gsm < 200) return [];
  if (['elem4-1', 'elem3-2'].includes(elem.id)) return [];
  return ALL_CREASING_COUNTS;
};

export const allowedRoundedCorners = (elem: Elemental): RoundedCorner[] => {
  if (['elem3-1', 'elem3-2'].includes(elem.id)) return [];
  if (isLabelStock(elem)) return ALL_ROUNDED_CORNERS;
  if (elem.paper.gsm < 170) return [];
  return ALL_ROUNDED_CORNERS;
};
