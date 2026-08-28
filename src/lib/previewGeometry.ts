import type { Binding, Elemental, FoldingType, Pocket, RoundedCorner, SpiralColor } from '../types';
import { convertSize } from './sizeUtils';
import { unfoldFactor, unfoldedSizeMm } from './foldUtils';

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
  // A wall calendar is bound along the edge it hangs from — the top — while a
  // catalog is bound down its side.
  spiral: { edge: 'left' | 'top'; color: SpiralColor; loops: number } | null;
  // Glued to one panel, not across the spine, so it carries its own left edge
  // and width rather than always spanning the sheet.
  pocket: { xMm: number; widthMm: number; heightMm: number } | null;
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

/** n cuts spread evenly, e.g. 2 → [1/3, 2/3]. Used for custom folds. */
const evenFractions = (count: number): number[] =>
  Array.from({ length: Math.max(0, count) }, (_, i) => (i + 1) / (count + 1));

// How far apart creases sit when a sheet takes more than one — the width of the
// folder spine they form, not a share of the sheet.
const CREASE_GAP_MM = 10;

/**
 * Creases group into a spine rather than dividing the sheet: the two creases of a
 * Mapă are its cotor, a spine width apart at the middle of the cover, not thirds
 * of it. Returned as fractions of the edge the lines are measured along.
 */
const creaseFractions = (count: number, spanMm: number): number[] => {
  if (count <= 0) return [];
  // A 55mm bookmark cannot hold a 10mm spine; never let the group spill off the sheet.
  const gapMm = Math.min(CREASE_GAP_MM, spanMm / (count + 1));
  return Array.from(
    { length: count },
    (_, i) => 0.5 + ((i - (count - 1) / 2) * gapMm) / spanMm
  );
};

const HOLE_RADIUS_MM = 3;
const HOLE_INSET_MM = 8;
// One loop per 8mm of spine, within reason — enough to read as a coil at any size.
const SPIRAL_MM_PER_LOOP = 8;
const SPIRAL_MIN_LOOPS = 4;
const SPIRAL_MAX_LOOPS = 28;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Fold and crease lines divide the sheet into panels, running perpendicular to
 * the edge they are measured along — a tri-folded DL leaflet is three 100×210
 * bands laid out across a 300mm sheet.
 *
 * `across` says which edge that is: true measures down the height and draws
 * horizontal lines, false measures along the width and draws vertical ones. The
 * caller decides, because on an opened sheet the answer is the axis the panels
 * were laid out along, which is not always the longer one.
 */
const linesAcross = (
  kind: PreviewLine['kind'],
  fractions: number[],
  widthMm: number,
  heightMm: number,
  across: boolean
): PreviewLine[] =>
  fractions.map((fraction) => {
    // Rounded to the micron: the fraction arithmetic leaves noise far below what
    // any press can hold, and it would otherwise be written straight into the
    // path data as 204.99999999999997.
    const at = Math.round((across ? heightMm : widthMm) * fraction * 1000) / 1000;
    return across
      ? { kind, x1: 0, y1: at, x2: widthMm, y2: at }
      : { kind, x1: at, y1: 0, x2: at, y2: heightMm };
  });

export function previewShapes({
  element,
  binding,
  pocket,
  punchHole,
  foldedInHalf,
}: {
  element: Elemental;
  binding?: Binding;
  pocket?: Pocket;
  punchHole?: boolean;
  // A Mapă is creased rather than folded, so it carries no folding type of its
  // own — this is how its cover says it is half of an A3 sheet. One more input
  // to unfoldFactor, not a drawing-only flag.
  foldedInHalf?: boolean;
}): PreviewShapes {
  const { folding, creasing, roundedCornes, staple } = element.finishing;

  // The element's size is the finished piece — what the customer holds. The
  // press runs the sheet it is folded from, and that is what has the fold lines,
  // the spine and the pocket on it, so that is what gets drawn.
  //
  // widthMm/heightMm, never the display width/height: switching the unit to
  // inches must not redraw the sheet.
  const factor = unfoldFactor(folding, foldedInHalf);
  const { widthMm, heightMm, grownAxis } = unfoldedSizeMm(
    element.size.widthMm,
    element.size.heightMm,
    factor
  );
  // An opened sheet is divided along the axis it opened on. A flat one never
  // grew, so it keeps the old rule: lines run across its longer edge.
  const across = factor > 1 ? grownAxis === 'y' : heightMm >= widthMm;

  const foldFractions =
    folding.type === 'custom' ? evenFractions(folding.folds) : FOLD_FRACTIONS[folding.type];

  // The edge the lines are measured along. It has to be the same one
  // linesAcross uses, or the 10mm spine creaseFractions lays out is scaled
  // against the wrong number and comes out the wrong width.
  const spanMm = across ? heightMm : widthMm;

  const creaseLines = linesAcross(
    'crease',
    creaseFractions(creasing.count, spanMm),
    widthMm,
    heightMm,
    across
  );

  const lines = [
    ...linesAcross('fold', foldFractions, widthMm, heightMm, across),
    ...creaseLines,
  ];

  // The pocket is glued to one panel, not across the spine: it starts at the
  // spine and runs out to the edge. A sheet with no spine to start from — a flat
  // product that takes a pocket — keeps the full-width band it had.
  const spineRightMm = creaseLines.reduce(
    (rightmost, line) => (line.x1 === line.x2 ? Math.max(rightmost, line.x1) : rightmost),
    0
  );

  // A hanging hole means the product hangs from that edge, so that is the edge
  // it is bound along — a wall calendar's wire runs across its top. Keyed on
  // `punchHole` alone and never on "there is a hole": a generic product may take
  // a spiral and a tassel hole together, and it is still bound down the side.
  // No spiral means no wire for the hole to sit in, so the inset rule stands.
  const spineOnTop = Boolean(punchHole) && binding?.type === 'spiral';

  // Two independent sources — the calendar's hanging hole is a product-level
  // choice, the bookmark's is part of its finishing — but one physical hole.
  const hasHole = Boolean(punchHole) || Boolean(staple?.hole);
  // The hanging hole is punched in the wire itself; every other one is inset
  // from the edge it is nearest.
  const holeCentre = { cxMm: widthMm / 2, cyMm: spineOnTop ? 0 : HOLE_INSET_MM };

  return {
    sheet: { widthMm, heightMm, corners: roundedCornes.corners },
    lines,
    holes: hasHole ? [{ ...holeCentre, rMm: HOLE_RADIUS_MM }] : [],
    // The staple sits over the hole it reinforces, and can be asked for without one.
    staple: staple?.staple ? holeCentre : null,
    spiral:
      binding?.type === 'spiral'
        ? {
            edge: spineOnTop ? 'top' : 'left',
            color: binding.color,
            // Counted along the spine that exists, not always the height.
            loops: Math.round(
              clamp(
                (spineOnTop ? widthMm : heightMm) / SPIRAL_MM_PER_LOOP,
                SPIRAL_MIN_LOOPS,
                SPIRAL_MAX_LOOPS
              )
            ),
          }
        : null,
    pocket: pocket
      ? {
          xMm: spineRightMm,
          widthMm: widthMm - spineRightMm,
          heightMm: convertSize(pocket.height, pocket.unit, 'mm'),
        }
      : null,
    sheetsBehind: element.pageCount <= 2 ? 0 : element.pageCount <= 8 ? 1 : 2,
  };
}
