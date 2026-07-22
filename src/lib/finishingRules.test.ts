import { describe, expect, it } from 'vitest';
import { allowedLaminationSides, clampLamination } from './finishingRules';
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
