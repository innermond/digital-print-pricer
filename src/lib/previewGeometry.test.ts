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

  it('splits the sheet once for a half-fold', () => {
    const folds = foldsOf(previewShapes({ element: folded('half-fold') }).lines);
    expect(folds).toHaveLength(1);
    expect(folds[0].y1).toBeCloseTo(148.5);
  });

  it('splits it in three for a tri-fold and a z-fold alike', () => {
    // Same three panels; which way each turns is not something a flat drawing shows.
    const tri = foldsOf(previewShapes({ element: folded('tri-fold') }).lines);
    const z = foldsOf(previewShapes({ element: folded('z-fold') }).lines);
    expect(tri).toHaveLength(2);
    expect(tri[0].y1).toBeCloseTo(99);
    expect(tri[1].y1).toBeCloseTo(198);
    expect(z).toEqual(tri);
  });

  it('puts a gate-fold quarter of the way in from each edge', () => {
    const folds = foldsOf(previewShapes({ element: folded('gate-fold') }).lines);
    expect(folds.map((f) => f.y1)).toEqual([297 / 4, (297 * 3) / 4]);
  });

  it('spreads a custom fold by its fold count', () => {
    const folds = foldsOf(previewShapes({ element: folded('custom', 3) }).lines);
    expect(folds).toHaveLength(3);
    expect(folds.map((f) => f.y1)).toEqual([297 / 4, 297 / 2, (297 * 3) / 4]);
  });

  it('runs the lines across the long edge of a portrait sheet', () => {
    const [fold] = foldsOf(previewShapes({ element: folded('half-fold') }).lines);
    // Horizontal: spans the full width at one height.
    expect(fold).toEqual({ kind: 'fold', x1: 0, y1: 148.5, x2: 210, y2: 148.5 });
  });

  it('turns them the other way for a landscape sheet', () => {
    const element = makeElemental({
      size: a4Landscape,
      finishing: makeFinishing({ folding: { type: 'half-fold', folds: 0 } }),
    });
    const [fold] = foldsOf(previewShapes({ element }).lines);
    // Vertical: spans the full height at one width.
    expect(fold).toEqual({ kind: 'fold', x1: 148.5, y1: 0, x2: 148.5, y2: 210 });
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
  it('draws a band as deep as the pocket', () => {
    expect(previewShapes({ element: makeElemental(), pocket }).pocket).toEqual({ heightMm: 100 });
  });

  it('converts a pocket described in another unit', () => {
    const inInches = { ...pocket, height: 4, unit: 'in' as const };
    expect(previewShapes({ element: makeElemental(), pocket: inInches }).pocket?.heightMm).toBeCloseTo(101.6);
  });

  it('draws nothing when the product has no pocket', () => {
    expect(previewShapes({ element: makeElemental() }).pocket).toBeNull();
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
