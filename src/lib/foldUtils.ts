import type { FoldingType } from '../types';

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
