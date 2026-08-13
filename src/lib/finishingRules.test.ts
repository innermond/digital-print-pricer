import { describe, expect, it } from 'vitest';
import {
  allowedCreasingCounts,
  allowedFoldTypes,
  allowedLaminationSides,
  allowedRoundedCorners,
  clampLamination,
  hasFinishingOptions,
} from './finishingRules';
import { makeElemental, makeFinishing, makeConfig, makePaper, makeSticker } from '../test/fixtures';
import { MOCK_CATALOG } from '../data/catalog';
import { MOCK_PAPERS } from '../data/mockData';

describe('allowedLaminationSides', () => {
  it('offers all three sides by default (no config restriction)', () => {
    expect(allowedLaminationSides()).toEqual(['front', 'back', 'both']);
    expect(allowedLaminationSides(makeConfig())).toEqual(['front', 'back', 'both']);
  });

  it('honours a product restriction from config', () => {
    const config = makeConfig({ allowedLaminationSides: ['front'] });
    expect(allowedLaminationSides(config)).toEqual(['front']);
  });
});

describe('allowedFoldTypes', () => {
  it('offers nothing without a config', () => {
    expect(allowedFoldTypes()).toEqual([]);
  });

  it('does not count none as a fold — a product that only allows none does not fold', () => {
    expect(allowedFoldTypes(makeConfig({ allowedFoldTypes: ['none'] }))).toEqual([]);
  });

  it('drops none from a config that offers real folds', () => {
    const config = makeConfig({ allowedFoldTypes: ['none', 'half-fold'] });
    expect(allowedFoldTypes(config)).toEqual(['half-fold']);
  });

  it('returns every fold when the config never offers none', () => {
    const config = makeConfig({ allowedFoldTypes: ['half-fold', 'tri-fold', 'z-fold'] });
    expect(allowedFoldTypes(config)).toEqual(['half-fold', 'tri-fold', 'z-fold']);
  });
});

describe('allowedCreasingCounts', () => {
  const heavy = makeElemental({ media: makePaper({ id: 'p5', gsm: 250 }) });

  it('offers the full range when the config says nothing', () => {
    expect(allowedCreasingCounts(heavy)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(allowedCreasingCounts(heavy, makeConfig())).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('offers nothing below the 200 GSM threshold, whatever the config asks for', () => {
    const thin = makeElemental({ media: makePaper({ id: 'p2', gsm: 120 }) });
    expect(allowedCreasingCounts(thin)).toEqual([]);
    // The media is the ceiling — a config cannot crease paper that won't hold one.
    expect(allowedCreasingCounts(thin, makeConfig({ allowedCreasingCounts: [2] }))).toEqual([]);
  });

  it('narrows to the counts a product offers', () => {
    const config = makeConfig({ allowedCreasingCounts: [0, 2, 4] });
    expect(allowedCreasingCounts(heavy, config)).toEqual([0, 2, 4]);
  });

  it('fixes a single count when that is all the product offers', () => {
    expect(allowedCreasingCounts(heavy, makeConfig({ allowedCreasingCounts: [2] }))).toEqual([2]);
  });

  it('rules creasing out entirely with an empty list', () => {
    expect(allowedCreasingCounts(heavy, makeConfig({ allowedCreasingCounts: [] }))).toEqual([]);
  });
});

describe('allowedCreasingCounts, per-element cap', () => {
  // The cap is authored on the elemental itself, beside the chosen count.
  const capped = (max: number | undefined, count = 0) =>
    makeElemental({
      media: makePaper({ id: 'p5', gsm: 250 }),
      finishing: makeFinishing({ creasing: { count, max } }),
    });

  const ranged = (min: number | undefined, max: number | undefined, count = 0) =>
    makeElemental({
      media: makePaper({ id: 'p5', gsm: 250 }),
      finishing: makeFinishing({ creasing: { count, min, max } }),
    });

  it('caps at an inclusive maximum', () => {
    expect(allowedCreasingCounts(capped(2))).toEqual([0, 1, 2]);
  });

  it('treats a cap of 0 as "offered, but only none" — not the same as []', () => {
    expect(allowedCreasingCounts(capped(0))).toEqual([0]);
    expect(allowedCreasingCounts(capped(undefined), makeConfig({ allowedCreasingCounts: [] })))
      .toEqual([]);
  });

  it('replaces the product-level list rather than intersecting it', () => {
    // The whole point: one part creases even though the product says none do.
    expect(allowedCreasingCounts(capped(2), makeConfig({ allowedCreasingCounts: [] })))
      .toEqual([0, 1, 2]);
    expect(allowedCreasingCounts(capped(1), makeConfig({ allowedCreasingCounts: [4, 5] })))
      .toEqual([0, 1]);
  });

  it('is still floored by the media, which a cap cannot lift', () => {
    const thin = makeElemental({
      media: makePaper({ id: 'p2', gsm: 120 }),
      finishing: makeFinishing({ creasing: { count: 0, max: 5 } }),
    });
    expect(allowedCreasingCounts(thin)).toEqual([]);
  });

  it('is bounded by the media range when the cap exceeds it', () => {
    expect(allowedCreasingCounts(capped(9))).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('leaves an uncapped elemental on the product-level path', () => {
    expect(allowedCreasingCounts(capped(undefined), makeConfig({ allowedCreasingCounts: [0, 2, 4] })))
      .toEqual([0, 2, 4]);
  });

  it('treats an undefined min as 0, unchanged from max alone', () => {
    expect(allowedCreasingCounts(ranged(undefined, 3))).toEqual([0, 1, 2, 3]);
  });

  it('narrows both ends of the range inclusively', () => {
    expect(allowedCreasingCounts(ranged(1, 3))).toEqual([1, 2, 3]);
  });

  it('pins a single value when min equals max — the structural cover case', () => {
    expect(allowedCreasingCounts(ranged(2, 2))).toEqual([2]);
  });

  it('applies a min with no max, floored only from below', () => {
    expect(allowedCreasingCounts(ranged(3, undefined))).toEqual([3, 4, 5]);
  });

  it('replaces the product-level list with a min alone, same as max alone', () => {
    expect(allowedCreasingCounts(ranged(3, undefined), makeConfig({ allowedCreasingCounts: [0] })))
      .toEqual([3, 4, 5]);
  });

  it('is still floored by the media, which a min cannot lift', () => {
    const thin = makeElemental({
      media: makePaper({ id: 'p2', gsm: 120 }),
      finishing: makeFinishing({ creasing: { count: 0, min: 1, max: 5 } }),
    });
    expect(allowedCreasingCounts(thin)).toEqual([]);
  });

  // Regression guard for the bug this field exists to fix: the cap used to be
  // read off creasing.count, so every pick narrowed the menu — a one-way
  // ratchet that ended with the control disappearing.
  it('does not move when the stored selection changes', () => {
    for (const count of [0, 1, 2, 3, 5]) {
      expect(allowedCreasingCounts(capped(3, count)), `stored count ${count}`)
        .toEqual([0, 1, 2, 3]);
    }
  });
});

describe('allowedCreasingCounts, wired to the real catalog', () => {
  it('bounds a Mapă de Prezentare cover to its structural range of one or two creases', () => {
    const cover = MOCK_CATALOG.products.find((p) => p.id === 'prod3a')!.elementals[0];
    expect(allowedCreasingCounts(cover, MOCK_CATALOG.config['prod3a'])).toEqual([1, 2]);
  });

  it('keeps creasing off posters, business cards and hang tags', () => {
    for (const id of ['prod0a', 'prod4a', 'prod8a']) {
      const elem = MOCK_CATALOG.products.find((p) => p.id === id)!.elementals[0];
      expect(allowedCreasingCounts(elem, MOCK_CATALOG.config[id])).toEqual([]);
    }
  });
});

describe('allowedRoundedCorners', () => {
  // The fixture paper is 250 GSM, comfortably over the 170 threshold.
  const heavy = makeElemental();

  it('offers all four corners when the config says nothing', () => {
    expect(allowedRoundedCorners(heavy)).toEqual([1, 2, 3, 4]);
    expect(allowedRoundedCorners(heavy, makeConfig())).toEqual([1, 2, 3, 4]);
  });

  it('offers nothing below the 170 GSM threshold, whatever the config asks for', () => {
    const thin = makeElemental({ media: makePaper({ id: 'p2', gsm: 120 }) });
    expect(allowedRoundedCorners(thin)).toEqual([]);
    // The media is the ceiling — a config cannot round a corner the stock won't hold.
    expect(allowedRoundedCorners(thin, makeConfig({ allowedRoundedCorners: [1] }))).toEqual([]);
  });

  it('offers nothing on a sticker, which is die-cut to shape already', () => {
    expect(allowedRoundedCorners(makeElemental({ media: makeSticker() }))).toEqual([]);
  });

  it('narrows to the corners a product offers', () => {
    // 1 = top-left, 2 = top-right: a hang tag rounded only along its top edge.
    expect(allowedRoundedCorners(heavy, makeConfig({ allowedRoundedCorners: [1, 2] })))
      .toEqual([1, 2]);
  });

  it('rules rounding out entirely with an empty list', () => {
    expect(allowedRoundedCorners(heavy, makeConfig({ allowedRoundedCorners: [] }))).toEqual([]);
  });
});

describe('allowedRoundedCorners, wired to the real catalog', () => {
  // Afiș and Mapă de Prezentare opt out by shape, not by weight — heavy board
  // must still come back empty. This replaced a hand-maintained blocklist of
  // element ids, so it is asserted per category: a folder product added later
  // has to inherit the opt-out rather than be appended to a list by hand.
  it.each(['afis', 'folder', 'calendar'])('keeps corners off every %s product, on any stock', (categoryId) => {
    const products = MOCK_CATALOG.products.filter((p) => p.categoryId === categoryId);
    // Guards the reverse failure: a renamed category silently emptying the loop.
    expect(products.length).toBeGreaterThan(0);
    const board = MOCK_PAPERS.find((p) => p.gsm === 350)!;
    for (const product of products) {
      const config = MOCK_CATALOG.config[product.id];
      expect(config, `${product.id} has no config entry`).toBeDefined();
      for (const elem of product.elementals) {
        expect(allowedRoundedCorners(elem, config), product.id).toEqual([]);
        // …and not merely because the default stock is too light.
        expect(allowedRoundedCorners({ ...elem, media: board }, config), `${product.id} on 350 GSM`)
          .toEqual([]);
      }
    }
  });

  it('still offers corners on a business card, the case the opt-out must not catch', () => {
    const card = MOCK_CATALOG.products.find((p) => p.id === 'prod4a')!.elementals[0];
    expect(allowedRoundedCorners(card, MOCK_CATALOG.config['prod4a'])).toEqual([1, 2, 3, 4]);
  });
});

describe('hasFinishingOptions', () => {
  const thin = makeElemental({ media: makePaper({ id: 'p2', gsm: 120 }) });
  const noFolds = makeConfig({ allowedFoldTypes: ['none'] });

  it('is false when the media and the config rule out everything', () => {
    expect(hasFinishingOptions(thin, noFolds)).toBe(false);
  });

  it('is true when the media alone allows something', () => {
    // 250 GSM clears the lamination, creasing and rounded-corner thresholds.
    expect(hasFinishingOptions(makeElemental(), noFolds)).toBe(true);
  });

  it('is true when only the config allows something', () => {
    expect(hasFinishingOptions(thin, makeConfig({ allowedFoldTypes: ['half-fold'] }))).toBe(true);
    expect(hasFinishingOptions(thin, makeConfig({ allowedStaple: { hole: true, staple: false } })))
      .toBe(true);
  });
});

describe('clampLamination', () => {
  it('resets the type to none when the media no longer allows lamination', () => {
    // 120 GSM paper is under the 170 threshold → allowedLaminationTypes is empty.
    const elem = makeElemental({
      media: makePaper({ id: 'p2', gsm: 120 }),
      finishing: makeFinishing({ lamination: { type: 'gloss', sides: 'front' } }),
    });
    expect(clampLamination(elem).finishing.lamination.type).toBe('none');
  });

  it('keeps the type when the media still allows lamination', () => {
    const elem = makeElemental({
      media: makePaper({ id: 'p5', gsm: 250 }),
      finishing: makeFinishing({ lamination: { type: 'gloss', sides: 'front' } }),
    });
    expect(clampLamination(elem)).toBe(elem);
  });

  it('coerces a side the config no longer permits to the first allowed side', () => {
    const elem = makeElemental({
      media: makePaper({ id: 'p5', gsm: 250 }),
      finishing: makeFinishing({ lamination: { type: 'gloss', sides: 'both' } }),
    });
    const config = makeConfig({ allowedLaminationSides: ['front'] });
    expect(clampLamination(elem, config).finishing.lamination.sides).toBe('front');
  });

  it('leaves a valid selection untouched and returns the same reference', () => {
    const elem = makeElemental({
      media: makePaper({ id: 'p5', gsm: 250 }),
      finishing: makeFinishing({ lamination: { type: 'gloss', sides: 'both' } }),
    });
    // No restriction — 'both' is allowed even with an unprinted back
    // (a blank verso can still be laminated).
    expect(clampLamination(elem)).toBe(elem);
    expect(clampLamination(elem, makeConfig())).toBe(elem);
  });
});
