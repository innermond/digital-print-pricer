import type { Finishing, FoldingType } from '../types';

// Pages = panels × 2 sides. A single flat sheet (none) has 2 pages (front + back).
const FOLD_PAGE_COUNT: Record<FoldingType, number> = {
  'none':      2,
  'half-fold': 4,
  'tri-fold':  6,
  'z-fold':    6,
  'gate-fold': 8,
  'custom':    2,
};

export const derivedPageCount = (foldingType: FoldingType): number =>
  FOLD_PAGE_COUNT[foldingType];

// How many times longer the flat sheet is than the finished piece.
//
// Deliberately not FOLD_PAGE_COUNT halved: a gate-fold has four panels but only
// doubles in length, because two of them are half-width flaps — ¼ + ½ + ¼ of the
// flat sheet closes to 2 of those units. The two tables answer different
// questions and must not be merged.
const UNFOLD_FACTOR: Record<FoldingType, number> = {
  'none':      1,
  'half-fold': 2,
  'tri-fold':  3,
  'z-fold':    3,
  'gate-fold': 2,
  'custom':    1,
};

/**
 * How much bigger the sheet on the press is than the size the customer set.
 *
 * `foldedInHalf` is the folder's structural fold: a Mapă is creased, not folded,
 * so it carries no folding type of its own, but its A4 cover is still half of an
 * A3 sheet. It only applies where there is no real fold to read.
 */
export type UnfoldedSize = {
  widthMm: number;
  heightMm: number;
  // Which edge the panels were laid out along, and so which way the folds run.
  grownAxis: 'x' | 'y';
};

export const unfoldFactor = (folding: Finishing['folding'], foldedInHalf?: boolean): number => {
  if (folding.type === 'custom') return Math.max(1, folding.folds + 1);
  const byType = UNFOLD_FACTOR[folding.type];
  if (byType > 1) return byType;
  return foldedInHalf ? 2 : 1;
};

/**
 * The flat sheet a folded piece is printed on.
 *
 * The panels sit side by side along the folded piece's *shorter* edge, so that
 * is the one that grows: a 100×210 leaflet opens to 300×210, an A4 folder cover
 * to 420×297. The fold lines then run parallel to the folded piece's long edge,
 * which is what previewGeometry's linesAcross already assumes of a flat sheet.
 * A square piece grows its width, arbitrarily but consistently.
 *
 * `grownAxis` has to be carried rather than re-derived: growing the shorter edge
 * does not always make it the longer one. A 100×250 piece opens to 200×250 —
 * still taller than it is wide, though it opened sideways — and a drawing that
 * guessed the axis from the shape would lay that fold down flat, across the very
 * panels it divides. Ignore it where the factor is 1 and nothing grew.
 */
export const unfoldedSizeMm = (
  widthMm: number,
  heightMm: number,
  factor: number
): UnfoldedSize =>
  widthMm <= heightMm
    ? { widthMm: widthMm * factor, heightMm, grownAxis: 'x' }
    : { widthMm, heightMm: heightMm * factor, grownAxis: 'y' };
