import { describe, expect, it } from 'vitest';
import {
  allowedFoldTypes,
  allowedLaminationSides,
  clampLamination,
  hasFinishingOptions,
} from './finishingRules';
import { makeElemental, makeFinishing, makeConfig, makePaper } from '../test/fixtures';

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
