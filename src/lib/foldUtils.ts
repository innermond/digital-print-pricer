import type { FoldingType, Size } from '../types';

// How many times wider the unfolded sheet is compared to the finished panel size.
const FOLD_WIDTH_MULTIPLIER: Record<FoldingType, number> = {
  'none':      1,
  'half-fold': 2,
  'tri-fold':  3,
  'z-fold':    3,
  'gate-fold': 4,
  'custom':    1,
};

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

// Returns the flat sheet size before any folding occurs.
// Height is unchanged; width is expanded by the fold multiplier.
// This is the size handed to the pricing engine for paper cost and imposition.
export const unfoldedSize = (size: Size, foldingType: FoldingType): Size => {
  const m = FOLD_WIDTH_MULTIPLIER[foldingType];
  return {
    ...size,
    width:   size.width   * m,
    widthMm: size.widthMm * m,
    label:   'Unfolded',
  };
};
