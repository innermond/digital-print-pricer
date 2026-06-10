import type { Elemental, LaminationType, RoundedCorner } from '../types';

const ALL_LAMINATION_TYPES: LaminationType[] = ['none', 'gloss', 'matt', 'soft-touch'];
const ALL_CREASING_COUNTS = [0, 1, 2, 3, 4, 5];
const ALL_ROUNDED_CORNERS: RoundedCorner[] = [1, 2, 3, 4];

export const allowedLaminationTypes = (elem: Elemental): LaminationType[] => {
  if (['elem3a-2', 'elem3c-2', 'elem3d-2'].includes(elem.id)) return [];
  switch (elem.media.kind) {
    case 'sticker': return ALL_LAMINATION_TYPES;
    case 'paper':   return elem.media.gsm < 170 ? [] : ALL_LAMINATION_TYPES;
  }
};

export const allowedCreasingCounts = (elem: Elemental): number[] => {
  if ([
    'elem4a-1', 'elem4b-1', 'elem4c-1', 'elem4d-1', 'elem4e-1',
    'elem3a-2', 'elem3c-2', 'elem3d-2',
    'elem8a-1', 'elem8b-1', 'elem8c-1', 'elem8d-1', 'elem8e-1',
  ].includes(elem.id)) return [];
  switch (elem.media.kind) {
    case 'sticker': return [];
    case 'paper':   return elem.media.gsm < 200 ? [] : ALL_CREASING_COUNTS;
  }
};

export const allowedRoundedCorners = (elem: Elemental): RoundedCorner[] => {
  if ([
    'elem3a-1', 'elem3a-2', 'elem3b-1',
    'elem3c-1', 'elem3c-2', 'elem3d-1', 'elem3d-2', 'elem3e-1',
  ].includes(elem.id)) return [];
  switch (elem.media.kind) {
    case 'sticker': return ALL_ROUNDED_CORNERS;
    case 'paper':   return elem.media.gsm < 170 ? [] : ALL_ROUNDED_CORNERS;
  }
};
