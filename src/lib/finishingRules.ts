import type { Elemental, LaminationType, LaminationSides, RoundedCorner } from '../types';
import type { ProductConfig } from '../data/mockData';

const ALL_LAMINATION_TYPES: LaminationType[] = ['none', 'gloss', 'matt', 'soft-touch'];
const ALL_LAMINATION_SIDES: LaminationSides[] = ['front', 'back', 'both'];
const ALL_CREASING_COUNTS = [0, 1, 2, 3, 4, 5];
const ALL_ROUNDED_CORNERS: RoundedCorner[] = [1, 2, 3, 4];

export const allowedLaminationTypes = (elem: Elemental): LaminationType[] => {
  switch (elem.media.kind) {
    case 'sticker': return [];
    case 'paper':
    case 'special':
      return elem.media.gsm < 170 ? [] : ALL_LAMINATION_TYPES;
  }
};

// Which lamination sides a product offers. Lamination is independent of what's
// printed — a blank verso can still be laminated — so this is a product decision
// (config), not something derived from the print. Defaults to all three.
export const allowedLaminationSides = (config?: ProductConfig): LaminationSides[] => {
  return config?.allowedLaminationSides ?? ALL_LAMINATION_SIDES;
};

// Which *real* folds a product offers. 'none' (Fără) is always on the table and is
// therefore not an "allowed fold" — an empty result means the product doesn't fold at all.
export const allowedFoldTypes = (config?: ProductConfig): string[] =>
  (config?.allowedFoldTypes ?? []).filter((type) => type !== 'none');

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

// What the stock itself can hold: a sticker never takes a crease, and paper under
// 200 GSM creases badly.
const creasableByMedia = (elem: Elemental): number[] => {
  switch (elem.media.kind) {
    case 'sticker': return [];
    case 'paper':
    case 'special':
      return elem.media.gsm < 200 ? [] : ALL_CREASING_COUNTS;
  }
};

// Creasing is a customer choice, so the counts on offer are catalog data. The media
// sets the physical ceiling; a product narrows it from there — to a subset, to a
// single structural count (a Mapă de Prezentare cover is always creased twice), or
// to nothing at all. Omit the config field to offer whatever the stock allows.
//
// Precedence is media > elemental > product: an elemental's own `creasing.min`/
// `creasing.max` replaces the product-level list for that one part, and the
// media floors both.
//
// All of this decides what is *offered*. The chosen value is
// `creasing.count`, and it is deliberately never read here — the range a value
// was picked from must not depend on which value was picked, or every choice
// would narrow the next one.
export const allowedCreasingCounts = (elem: Elemental, config?: ProductConfig): number[] => {
  const byMedia = creasableByMedia(elem);
  // by media constraint is strongest - as it stems in physical reality
  if (byMedia.length === 0) return byMedia;

  // A per-element min/max replaces the product-level list outright, so one part
  // of a product can crease while the rest cannot. Filtering byMedia rather than
  // building a fresh range keeps the physical floor: neither bound can offer a
  // crease the stock won't hold.
  const { min, max } = elem.finishing.creasing;
  if (min !== undefined || max !== undefined) {
    const lo = min ?? 0;
    return byMedia.filter((count) => count >= lo && (max === undefined || count <= max));
  }

  const allowed = config?.allowedCreasingCounts;
  return allowed ? byMedia.filter((count) => allowed.includes(count)) : byMedia;
};

// What the stock itself can take: a sticker is die-cut to shape already, and
// paper under 170 GSM frays instead of cutting clean.
const roundableByMedia = (elem: Elemental): RoundedCorner[] => {
  switch (elem.media.kind) {
    case 'sticker': return [];
    case 'paper':
    case 'special':
      return elem.media.gsm < 170 ? [] : ALL_ROUNDED_CORNERS;
  }
};

// Rounding is a customer choice, so the corners on offer are catalog data. The
// media sets the physical ceiling; a product narrows it from there — to a subset
// (only the two top corners of a hang tag, say), or to nothing at all when the
// shape rules rounding out regardless of weight: a poster is trimmed square, and
// a Mapă de Prezentare cover is a folded panel rather than a cut card. Omit the
// config field to offer whatever the stock allows.
export const allowedRoundedCorners = (elem: Elemental, config?: ProductConfig): RoundedCorner[] => {
  const byMedia = roundableByMedia(elem);
  const allowed = config?.allowedRoundedCorners;
  return allowed ? byMedia.filter((corner) => allowed.includes(corner)) : byMedia;
};

// Whether this elemental has any finishing to offer at all. Every dimension can be
// ruled out at once (a 120 GSM flyer, say), and then there is no finishing section
// to draw — heading, separator and all.
export const hasFinishingOptions = (elem: Elemental, config: ProductConfig): boolean =>
  allowedLaminationTypes(elem).length > 0 ||
  allowedFoldTypes(config).length > 0 ||
  allowedCreasingCounts(elem, config).length > 0 ||
  allowedRoundedCorners(elem, config).length > 0 ||
  Boolean(config.allowedStaple);
