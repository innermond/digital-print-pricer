import { describe, expect, it } from 'vitest';
import { advancedSummary, isPersonalized } from './personalization';
import { makeElemental, makeFinishing, makeSize } from '../test/fixtures';
import type { Product } from '../types';

const base = makeElemental();

const makeProduct = (elementals = [base]): Product => ({
  id: 'prod1a',
  categoryId: 'flyer',
  label: 'Fluturaș',
  amount: 50,
  elementals,
});

describe('isPersonalized', () => {
  it('is false for an untouched product', () => {
    expect(isPersonalized(makeProduct(), makeProduct())) .toBe(false);
  });

  it('is true once an elemental diverges', () => {
    const changed = makeProduct([
      makeElemental({ finishing: makeFinishing({ lamination: { type: 'matt', sides: 'both' } }) }),
    ]);
    expect(isPersonalized(changed, makeProduct())).toBe(true);
  });

  it('is false without a baseline to compare against', () => {
    expect(isPersonalized(makeProduct(), undefined)).toBe(false);
  });
});

describe('advancedSummary', () => {
  it('is empty when nothing diverges', () => {
    expect(advancedSummary(base, base)).toEqual([]);
  });

  it('is empty without a baseline', () => {
    expect(advancedSummary(base, undefined)).toEqual([]);
  });

  it('describes a lamination change in Romanian', () => {
    const changed = makeElemental({
      finishing: makeFinishing({ lamination: { type: 'matt', sides: 'front' } }),
    });
    expect(advancedSummary(changed, base)).toContain('Laminare: Mat · față');
  });

  it('describes lamination removal without a side', () => {
    const laminated = makeElemental({
      finishing: makeFinishing({ lamination: { type: 'gloss', sides: 'both' } }),
    });
    expect(advancedSummary(base, laminated)).toContain('Laminare: Fără');
  });

  it('describes folding, creasing and corner changes', () => {
    const changed = makeElemental({
      finishing: makeFinishing({
        folding: { type: 'tri-fold', folds: 2 },
        creasing: { count: 2 },
        roundedCornes: { corners: [1, 2] },
      }),
    });
    const chips = advancedSummary(changed, base);
    expect(chips).toContain('Pliere: În trei');
    expect(chips).toContain('Biguitură: 2');
    expect(chips).toContain('Colțuri rotunjite: 2');
  });

  it('reports a custom size', () => {
    const changed = makeElemental({
      size: makeSize({ id: 'custom', label: 'Personalizat', width: 100, height: 150, widthMm: 100, heightMm: 150 }),
    });
    expect(advancedSummary(changed, base)).toContain('Dimensiune: 100.0 × 150.0 mm');
  });

  it('ignores an essential change, which stays visible on its own', () => {
    // Media lives in the essentials, so it never needs a chip.
    const changed = makeElemental({ pageCount: 8 });
    expect(advancedSummary(changed, base)).toEqual([]);
  });
});
