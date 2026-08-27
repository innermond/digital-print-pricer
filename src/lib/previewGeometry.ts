import type { Binding, Elemental, FoldingType, Pocket, RoundedCorner, SpiralColor } from '../types';
import { convertSize } from './sizeUtils';

// The shapes that make up the product drawing, in millimetres, in the sheet's
// own coordinate space (origin at its top-left corner). Kept apart from the SVG
// so the arithmetic can be tested without rendering anything — the same split
// foldUtils and pocket already use.

export type PreviewLine = {
  // Folds are drawn dashed, creases dash-dot: a folder is creased but not folded.
  kind: 'fold' | 'crease';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type PreviewShapes = {
  sheet: { widthMm: number; heightMm: number; corners: RoundedCorner[] };
  lines: PreviewLine[];
  holes: { cxMm: number; cyMm: number; rMm: number }[];
  staple: { cxMm: number; cyMm: number } | null;
  spiral: { color: SpiralColor; loops: number } | null;
  pocket: { heightMm: number } | null;
  // A depth cue, not a page count: how many sheets to suggest behind this one.
  sheetsBehind: number;
};

// Where the panels divide, as fractions of the folded dimension. A z-fold and a
// tri-fold split the sheet in the same three places — what differs is which way
// each panel turns, which a flat drawing cannot show anyway.
const FOLD_FRACTIONS: Record<FoldingType, number[]> = {
  none: [],
  'half-fold': [1 / 2],
  'tri-fold': [1 / 3, 2 / 3],
  'z-fold': [1 / 3, 2 / 3],
  'gate-fold': [1 / 4, 3 / 4],
  custom: [],
};

/** n cuts spread evenly, e.g. 2 → [1/3, 2/3]. Used for creases and custom folds. */
const evenFractions = (count: number): number[] =>
  Array.from({ length: Math.max(0, count) }, (_, i) => (i + 1) / (count + 1));

const HOLE_RADIUS_MM = 3;
const HOLE_INSET_MM = 8;
// One loop per 8mm of spine, within reason — enough to read as a coil at any size.
const SPIRAL_MM_PER_LOOP = 8;
const SPIRAL_MIN_LOOPS = 4;
const SPIRAL_MAX_LOOPS = 28;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Fold and crease lines run perpendicular to the sheet's longer edge, dividing
 * it into panels — a tri-folded A4 portrait is three 210×99 bands, which is the
 * DL leaflet it really makes.
 */
const linesAcross = (
  kind: PreviewLine['kind'],
  fractions: number[],
  widthMm: number,
  heightMm: number
): PreviewLine[] =>
  fractions.map((fraction) =>
    heightMm >= widthMm
      ? { kind, x1: 0, y1: heightMm * fraction, x2: widthMm, y2: heightMm * fraction }
      : { kind, x1: widthMm * fraction, y1: 0, x2: widthMm * fraction, y2: heightMm }
  );

export function previewShapes({
  element,
  binding,
  pocket,
  punchHole,
}: {
  element: Elemental;
  binding?: Binding;
  pocket?: Pocket;
  punchHole?: boolean;
}): PreviewShapes {
  // widthMm/heightMm, never the display width/height: switching the unit to
  // inches must not redraw the sheet.
  const { widthMm, heightMm } = element.size;
  const { folding, creasing, roundedCornes, staple } = element.finishing;

  const foldFractions =
    folding.type === 'custom' ? evenFractions(folding.folds) : FOLD_FRACTIONS[folding.type];

  const lines = [
    ...linesAcross('fold', foldFractions, widthMm, heightMm),
    ...linesAcross('crease', evenFractions(creasing.count), widthMm, heightMm),
  ];

  // Two independent sources — the calendar's hanging hole is a product-level
  // choice, the bookmark's is part of its finishing — but one physical hole.
  const hasHole = Boolean(punchHole) || Boolean(staple?.hole);
  const holeCentre = { cxMm: widthMm / 2, cyMm: HOLE_INSET_MM };

  return {
    sheet: { widthMm, heightMm, corners: roundedCornes.corners },
    lines,
    holes: hasHole ? [{ ...holeCentre, rMm: HOLE_RADIUS_MM }] : [],
    // The staple sits over the hole it reinforces, and can be asked for without one.
    staple: staple?.staple ? holeCentre : null,
    spiral:
      binding?.type === 'spiral'
        ? {
            color: binding.color,
            loops: Math.round(clamp(heightMm / SPIRAL_MM_PER_LOOP, SPIRAL_MIN_LOOPS, SPIRAL_MAX_LOOPS)),
          }
        : null,
    pocket: pocket ? { heightMm: convertSize(pocket.height, pocket.unit, 'mm') } : null,
    sheetsBehind: element.pageCount <= 2 ? 0 : element.pageCount <= 8 ? 1 : 2,
  };
}
