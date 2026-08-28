import { describe, expect, it } from 'vitest';
import { previewShapes } from './previewGeometry';
import type { PreviewLine } from './previewGeometry';
import { makeElemental, makeFinishing, makeSize } from '../test/fixtures';
import type { FoldingType, Pocket } from '../types';

const a4 = makeSize(); // 210 × 297, portrait
const a4Landscape = makeSize({ width: 297, height: 210, widthMm: 297, heightMm: 210 });

const folded = (type: FoldingType, folds = 0) =>
  makeElemental({ finishing: makeFinishing({ folding: { type, folds } }) });

const foldsOf = (lines: PreviewLine[]) => lines.filter((l) => l.kind === 'fold');
const creasesOf = (lines: PreviewLine[]) => lines.filter((l) => l.kind === 'crease');

const pocket: Pocket = {
  label: 'Buzunar',
  mediaId: 'p5',
  width: 210,
  height: 100,
  unit: 'mm',
  pageCount: 2,
  printing: { front: 'none', back: 'none' },
};

describe('previewShapes — the sheet', () => {
  it('takes its dimensions and corners from the element', () => {
    const element = makeElemental({
      finishing: makeFinishing({ roundedCornes: { corners: [1, 4] } }),
    });
    expect(previewShapes({ element }).sheet).toEqual({
      widthMm: 210,
      heightMm: 297,
      corners: [1, 4],
    });
  });

  it('draws the same sheet whatever unit the size is displayed in', () => {
    // Same paper, one described in inches: the drawing must not notice.
    const inInches = makeSize({ width: 8.27, height: 11.69, unit: 'in' });
    expect(previewShapes({ element: makeElemental({ size: inInches }) })).toEqual(
      previewShapes({ element: makeElemental({ size: a4 }) })
    );
  });
});

describe('previewShapes — folds', () => {
  it('draws no lines for an unfolded sheet', () => {
    expect(previewShapes({ element: folded('none') }).lines).toEqual([]);
  });

  it('opens the finished piece out into the sheet it is folded from', () => {
    // The size is the A4 in the customer's hand; the press runs the A3 it is
    // half of.
    expect(previewShapes({ element: folded('half-fold') }).sheet).toEqual({
      widthMm: 420,
      heightMm: 297,
      corners: [],
    });
  });

  it('splits the sheet once for a half-fold', () => {
    const folds = foldsOf(previewShapes({ element: folded('half-fold') }).lines);
    expect(folds).toHaveLength(1);
    // Half of the 420mm open sheet — which is the 210mm folded panel back again.
    expect(folds[0].x1).toBeCloseTo(210);
  });

  it('splits it in three for a tri-fold and a z-fold alike', () => {
    // Same three panels; which way each turns is not something a flat drawing shows.
    const tri = foldsOf(previewShapes({ element: folded('tri-fold') }).lines);
    const z = foldsOf(previewShapes({ element: folded('z-fold') }).lines);
    expect(tri).toHaveLength(2);
    expect(tri[0].x1).toBeCloseTo(210);
    expect(tri[1].x1).toBeCloseTo(420);
    expect(z).toEqual(tri);
  });

  it('puts a gate-fold quarter of the way in from each edge', () => {
    // Two half-width flaps closing over the middle: the sheet is twice the
    // finished piece, not four times, however many panels that makes.
    const { sheet, lines } = previewShapes({ element: folded('gate-fold') });
    expect(sheet.widthMm).toBe(420);
    expect(foldsOf(lines).map((f) => f.x1)).toEqual([420 / 4, (420 * 3) / 4]);
  });

  it('spreads a custom fold by its fold count', () => {
    const { sheet, lines } = previewShapes({ element: folded('custom', 3) });
    expect(sheet.widthMm).toBe(840);
    const folds = foldsOf(lines);
    expect(folds).toHaveLength(3);
    expect(folds.map((f) => f.x1)).toEqual([840 / 4, 840 / 2, (840 * 3) / 4]);
  });

  it('runs the lines along the long edge of a portrait piece', () => {
    const [fold] = foldsOf(previewShapes({ element: folded('half-fold') }).lines);
    // Vertical: the panels sit side by side, so the sheet opens sideways.
    expect(fold).toEqual({ kind: 'fold', x1: 210, y1: 0, x2: 210, y2: 297 });
  });

  it('keeps the fold square to the edge that grew on a narrow piece', () => {
    // 100×250 opens to 200×250 — wider than it was, but still the taller way
    // round. Reading the axis back off that shape would lay the fold flat,
    // across the very panels it divides.
    const element = makeElemental({
      size: makeSize({ width: 100, height: 250, widthMm: 100, heightMm: 250 }),
      finishing: makeFinishing({ folding: { type: 'half-fold', folds: 1 } }),
    });
    const { sheet, lines } = previewShapes({ element });
    expect(sheet).toMatchObject({ widthMm: 200, heightMm: 250 });
    expect(foldsOf(lines)[0]).toEqual({ kind: 'fold', x1: 100, y1: 0, x2: 100, y2: 250 });
  });

  it('turns them the other way for a landscape piece', () => {
    const element = makeElemental({
      size: a4Landscape,
      finishing: makeFinishing({ folding: { type: 'half-fold', folds: 0 } }),
    });
    const { sheet, lines } = previewShapes({ element });
    // The short edge is the height now, so that is the one that grows.
    expect(sheet).toMatchObject({ widthMm: 297, heightMm: 420 });
    expect(foldsOf(lines)[0]).toEqual({ kind: 'fold', x1: 0, y1: 210, x2: 297, y2: 210 });
  });
});

describe('previewShapes — creases', () => {
  it('draws creases as their own kind, not as folds', () => {
    const element = makeElemental({ finishing: makeFinishing({ creasing: { count: 2 } }) });
    const { lines } = previewShapes({ element });
    expect(creasesOf(lines)).toHaveLength(2);
    expect(foldsOf(lines)).toHaveLength(0);
  });

  it('draws both when a sheet is creased and folded', () => {
    const element = makeElemental({
      finishing: makeFinishing({
        folding: { type: 'half-fold', folds: 0 },
        creasing: { count: 1 },
      }),
    });
    const { lines } = previewShapes({ element });
    expect(foldsOf(lines)).toHaveLength(1);
    expect(creasesOf(lines)).toHaveLength(1);
  });

  it('draws nothing for an uncreased sheet', () => {
    expect(creasesOf(previewShapes({ element: makeElemental() }).lines)).toEqual([]);
  });

  it('groups a pair into a spine at the middle rather than into thirds', () => {
    // The cotor of a Mapă: two creases a spine width apart, not a 99mm division
    // of the cover.
    const element = makeElemental({ finishing: makeFinishing({ creasing: { count: 2 } }) });
    const creases = creasesOf(previewShapes({ element }).lines);
    expect(creases.map((c) => c.y1)).toEqual([143.5, 153.5]);
  });

  it('leaves a single crease dead centre', () => {
    const element = makeElemental({ finishing: makeFinishing({ creasing: { count: 1 } }) });
    const [crease] = creasesOf(previewShapes({ element }).lines);
    expect(crease).toEqual({ kind: 'crease', x1: 0, y1: 148.5, x2: 210, y2: 148.5 });
  });

  it('groups them across the short edge of a landscape sheet', () => {
    const element = makeElemental({
      size: a4Landscape,
      finishing: makeFinishing({ creasing: { count: 2 } }),
    });
    const creases = creasesOf(previewShapes({ element }).lines);
    // Vertical, straddling the middle of the 297mm width.
    expect(creases.map((c) => c.x1)).toEqual([143.5, 153.5]);
    expect(creases[0]).toEqual({ kind: 'crease', x1: 143.5, y1: 0, x2: 143.5, y2: 210 });
  });

  it('narrows the gap on a sheet too small to hold it', () => {
    // 30 x 40: a 10mm spine would eat the sheet, so the group closes up instead.
    const element = makeElemental({
      size: makeSize({ width: 30, height: 40, widthMm: 30, heightMm: 40 }),
      finishing: makeFinishing({ creasing: { count: 3 } }),
    });
    const creases = creasesOf(previewShapes({ element }).lines);
    expect(creases.map((c) => c.y1)).toEqual([10, 20, 30]);
    creases.forEach((crease) => {
      expect(crease.y1).toBeGreaterThan(0);
      expect(crease.y1).toBeLessThan(40);
    });
  });
});

describe('previewShapes — hole and staple', () => {
  it('draws a hole for a product-level punch hole', () => {
    const { holes } = previewShapes({ element: makeElemental(), punchHole: true });
    expect(holes).toEqual([{ cxMm: 105, cyMm: 8, rMm: 3 }]);
  });

  it('draws a hole for an element that asks for one in its finishing', () => {
    const element = makeElemental({
      finishing: makeFinishing({ staple: { hole: true, staple: false } }),
    });
    expect(previewShapes({ element }).holes).toHaveLength(1);
  });

  it('draws one hole, not two, when both ask for it', () => {
    const element = makeElemental({
      finishing: makeFinishing({ staple: { hole: true, staple: false } }),
    });
    expect(previewShapes({ element, punchHole: true }).holes).toHaveLength(1);
  });

  it('draws no hole when neither asks', () => {
    expect(previewShapes({ element: makeElemental() }).holes).toEqual([]);
  });

  it('puts the staple over the hole it reinforces', () => {
    const element = makeElemental({
      finishing: makeFinishing({ staple: { hole: true, staple: true } }),
    });
    const { holes, staple } = previewShapes({ element });
    expect(staple).toEqual({ cxMm: holes[0].cxMm, cyMm: holes[0].cyMm });
  });

  it('draws no staple unless one was asked for', () => {
    const element = makeElemental({
      finishing: makeFinishing({ staple: { hole: true, staple: false } }),
    });
    expect(previewShapes({ element }).staple).toBeNull();
  });
});

describe('previewShapes — spiral', () => {
  it('draws a coil in the bound colour', () => {
    const { spiral } = previewShapes({
      element: makeElemental(),
      binding: { type: 'spiral', color: 'black' },
    });
    expect(spiral?.color).toBe('black');
    expect(spiral?.loops).toBeGreaterThan(0);
  });

  it('draws no coil for an unbound product', () => {
    expect(previewShapes({ element: makeElemental(), binding: { type: 'none' } }).spiral).toBeNull();
    expect(previewShapes({ element: makeElemental() }).spiral).toBeNull();
  });

  it('binds a hanging product along the edge it hangs from', () => {
    // A wall calendar: the wire runs across the top, and the hole is in it.
    const { spiral, holes } = previewShapes({
      element: makeElemental(),
      binding: { type: 'spiral', color: 'white' },
      punchHole: true,
    });
    expect(spiral?.edge).toBe('top');
    expect(holes).toEqual([{ cxMm: 105, cyMm: 0, rMm: 3 }]);
  });

  it('binds a product with no hanging hole down its side', () => {
    // A spiral catalog: same binding, no hole, bound like a book.
    const { spiral, holes } = previewShapes({
      element: makeElemental(),
      binding: { type: 'spiral', color: 'white' },
    });
    expect(spiral?.edge).toBe('left');
    expect(holes).toEqual([]);
  });

  it('keeps a tassel hole from moving the spine', () => {
    // A generic product may take a spiral and a staple hole together. That hole
    // is for a string, not for hanging, so the spine stays on the side and the
    // hole stays inset.
    const element = makeElemental({
      finishing: makeFinishing({ staple: { hole: true, staple: false } }),
    });
    const { spiral, holes } = previewShapes({
      element,
      binding: { type: 'spiral', color: 'white' },
    });
    expect(spiral?.edge).toBe('left');
    expect(holes[0].cyMm).toBe(8);
  });

  it('leaves the hole inset when there is no wire to punch it in', () => {
    const { holes } = previewShapes({ element: makeElemental(), punchHole: true });
    expect(holes[0].cyMm).toBe(8);
  });

  it('counts the loops along the spine that exists, not always the height', () => {
    const element = makeElemental({ size: a4Landscape }); // 297 wide × 210 tall
    const topBound = previewShapes({
      element,
      binding: { type: 'spiral', color: 'white' },
      punchHole: true,
    });
    const sideBound = previewShapes({ element, binding: { type: 'spiral', color: 'white' } });
    // 297mm of top spine against 210mm of side spine.
    expect(topBound.spiral!.loops).toBeGreaterThan(sideBound.spiral!.loops);
  });

  it('scales the loops to the spine, within reason', () => {
    const tall = previewShapes({
      element: makeElemental(),
      binding: { type: 'spiral', color: 'white' },
    });
    const tiny = previewShapes({
      element: makeElemental({ size: makeSize({ width: 30, height: 40, widthMm: 30, heightMm: 40 }) }),
      binding: { type: 'spiral', color: 'white' },
    });
    expect(tall.spiral!.loops).toBeGreaterThan(tiny.spiral!.loops);
    // A 40mm spine would be 5 loops on the raw ratio; the floor keeps it legible.
    expect(tiny.spiral!.loops).toBeGreaterThanOrEqual(4);
    expect(tall.spiral!.loops).toBeLessThanOrEqual(28);
  });
});

describe('previewShapes — pocket', () => {
  it('spans the sheet on a flat product, as deep as the pocket', () => {
    // No spine to start from, so the band runs the full width, as it always has.
    expect(previewShapes({ element: makeElemental(), pocket }).pocket).toEqual({
      xMm: 0,
      widthMm: 210,
      heightMm: 100,
    });
  });

  it('converts a pocket described in another unit', () => {
    const inInches = { ...pocket, height: 4, unit: 'in' as const };
    expect(previewShapes({ element: makeElemental(), pocket: inInches }).pocket?.heightMm).toBeCloseTo(101.6);
  });

  it('draws nothing when the product has no pocket', () => {
    expect(previewShapes({ element: makeElemental() }).pocket).toBeNull();
  });
});

describe('previewShapes — folded in half', () => {
  // A Mapă: A4 finished, cut from an A3 sheet, creased twice into a spine.
  const mapa = makeElemental({ finishing: makeFinishing({ creasing: { count: 2 } }) });

  it('draws the sheet the panel was folded from, not the panel', () => {
    expect(previewShapes({ element: mapa, foldedInHalf: true }).sheet).toEqual({
      widthMm: 420,
      heightMm: 297,
      corners: [],
    });
  });

  it('runs the spine down the middle of the open sheet', () => {
    const creases = creasesOf(previewShapes({ element: mapa, foldedInHalf: true }).lines);
    // Vertical now that the sheet is landscape, 10mm apart, straddling x = 210.
    expect(creases.map((c) => c.x1)).toEqual([205, 215]);
    expect(creases[0]).toEqual({ kind: 'crease', x1: 205, y1: 0, x2: 205, y2: 297 });
  });

  it('glues the pocket to one panel, from the spine out to the edge', () => {
    const band = previewShapes({ element: mapa, pocket, foldedInHalf: true }).pocket!;
    expect(band).toEqual({ xMm: 215, widthMm: 205, heightMm: 100 });
    // Flush with the right edge of the open sheet.
    expect(band.xMm + band.widthMm).toBe(420);
  });

  it('starts the pocket at the single crease of a folder with no cotor', () => {
    const element = makeElemental({ finishing: makeFinishing({ creasing: { count: 1 } }) });
    const { lines, pocket: band } = previewShapes({ element, pocket, foldedInHalf: true });
    expect(creasesOf(lines).map((c) => c.x1)).toEqual([210]);
    expect(band).toEqual({ xMm: 210, widthMm: 210, heightMm: 100 });
    // Exactly half the open sheet: no cotor to give the pocket a head start.
    expect(band!.widthMm).toBe(420 / 2);
  });

  it('opens a smaller folder the same way', () => {
    // The A5 Mapă: a folded A4, whose panel is narrower than the 200mm pocket
    // the catalog claims for every folder — so the drawn pocket fills the panel.
    const element = makeElemental({
      size: makeSize({ width: 148, height: 210, widthMm: 148, heightMm: 210 }),
      finishing: makeFinishing({ creasing: { count: 2 } }),
    });
    const { sheet, lines, pocket: band } = previewShapes({ element, pocket, foldedInHalf: true });
    expect(sheet.widthMm).toBe(296);
    expect(creasesOf(lines).map((c) => c.x1)).toEqual([143, 153]);
    expect(band).toEqual({ xMm: 153, widthMm: 143, heightMm: 100 });
  });

  it('leaves a product that is not folded in half exactly as it was', () => {
    const { sheet, lines, pocket: band } = previewShapes({ element: mapa, pocket });
    expect(sheet.widthMm).toBe(210);
    // Horizontal, across the portrait sheet.
    expect(creasesOf(lines).map((c) => c.y1)).toEqual([143.5, 153.5]);
    expect(band).toEqual({ xMm: 0, widthMm: 210, heightMm: 100 });
  });
});

describe('previewShapes — page depth', () => {
  it('lies flat for a single sheet', () => {
    expect(previewShapes({ element: makeElemental({ pageCount: 2 }) }).sheetsBehind).toBe(0);
  });

  it('suggests a stack for a few pages', () => {
    expect(previewShapes({ element: makeElemental({ pageCount: 8 }) }).sheetsBehind).toBe(1);
  });

  it('deepens the stack for many pages without counting them', () => {
    expect(previewShapes({ element: makeElemental({ pageCount: 24 }) }).sheetsBehind).toBe(2);
    expect(previewShapes({ element: makeElemental({ pageCount: 240 }) }).sheetsBehind).toBe(2);
  });
});
