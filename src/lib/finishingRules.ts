import type { Elemental, LaminationType, LaminationSides, RoundedCorner } from '../types';
import type { ProductConfig } from '../data/mockData';

const ALL_LAMINATION_TYPES: LaminationType[] = ['none', 'gloss', 'matt', 'soft-touch'];
const ALL_LAMINATION_SIDES: LaminationSides[] = ['front', 'back', 'both'];
const ALL_CREASING_COUNTS = [0, 1, 2, 3, 4, 5];
const ALL_ROUNDED_CORNERS: RoundedCorner[] = [1, 2, 3, 4];

export const allowedLaminationTypes = (elem: Elemental): LaminationType[] => {
  if (['elem3a-2', 'elem3c-2', 'elem3d-2'].includes(elem.id)) return [];
  switch (elem.media.kind) {
    case 'sticker': return ALL_LAMINATION_TYPES;
    case 'paper':   return elem.media.gsm < 170 ? [] : ALL_LAMINATION_TYPES;
  }
};

// Which lamination sides a product offers. Lamination is independent of what's
// printed — a blank verso can still be laminated — so this is a product decision
// (config), not something derived from the print. Defaults to all three.
export const allowedLaminationSides = (config?: ProductConfig): LaminationSides[] => {
  return config?.allowedLaminationSides ?? ALL_LAMINATION_SIDES;
};

// Coerce a stale lamination selection back into what's currently allowed, after
// another change invalidates it:
//   - type  → 'none' when the media no longer permits lamination (e.g. switching
//             to a paper under 170 GSM, where allowedLaminationTypes is empty).
//   - sides → the first allowed side when a restricting config forbids the current one.
// Returns the same elemental untouched when nothing needs clamping.
export const clampLamination = (elem: Elemental, config?: ProductConfig): Elemental => {
  const { lamination } = elem.finishing;
  const allowedTypes = allowedLaminationTypes(elem);
  const allowedSides = allowedLaminationSides(config);

  // 'none' (Fără) is always available; any other type must be permitted by the media.
  const type =
    lamination.type === 'none' || allowedTypes.includes(lamination.type)
      ? lamination.type
      : 'none';
  const sides = allowedSides.includes(lamination.sides) ? lamination.sides : allowedSides[0];

  if (type === lamination.type && sides === lamination.sides) return elem;
  return {
    ...elem,
    finishing: { ...elem.finishing, lamination: { ...lamination, type, sides } },
  };
};

export const allowedCreasingCounts = (elem: Elemental): number[] => {
  if ([
    'elem0a-1', 'elem0b-1', 'elem0c-1', 'elem0d-1',
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
    'elem0a-1', 'elem0b-1', 'elem0c-1', 'elem0d-1',
    'elem3a-1', 'elem3a-2', 'elem3b-1',
    'elem3c-1', 'elem3c-2', 'elem3d-1', 'elem3d-2', 'elem3e-1',
  ].includes(elem.id)) return [];
  switch (elem.media.kind) {
    case 'sticker': return ALL_ROUNDED_CORNERS;
    case 'paper':   return elem.media.gsm < 170 ? [] : ALL_ROUNDED_CORNERS;
  }
};
