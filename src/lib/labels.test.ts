import { describe, expect, it } from 'vitest';
import { describeProduct } from './labels';
import { makeElemental, makeFinishing, makeSize } from '../test/fixtures';
import type { Product } from '../types';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  categoryId: 'brochure',
  label: 'Broșură A5, Interior 16 Pagini',
  amount: 10,
  elementals: [makeElemental()],
  ...overrides,
});

const a5 = makeSize({ id: 's2', label: 'A5', width: 148, height: 210, widthMm: 148, heightMm: 210 });

describe('describeProduct', () => {
  it('says a shared size once, then every element with its page count', () => {
    const product = makeProduct({
      elementals: [
        makeElemental({ id: 'e1', label: 'Copertă', size: a5, pageCount: 4 }),
        makeElemental({ id: 'e2', label: 'Interior', size: a5, pageCount: 24 }),
      ],
    });
    expect(describeProduct(product)).toBe('A5 · Copertă 4 p. · Interior 24 p.');
  });

  it('gives each element its own size when they differ', () => {
    const product = makeProduct({
      elementals: [
        makeElemental({ id: 'e1', label: 'Copertă', pageCount: 4 }),
        makeElemental({ id: 'e2', label: 'Interior', size: a5, pageCount: 24 }),
      ],
    });
    expect(describeProduct(product)).toBe('Copertă A4 4 p. · Interior A5 24 p.');
  });

  it('gives dimensions for a custom size, which has no name worth showing', () => {
    const custom = makeSize({
      id: 'custom', label: 'Personalizat',
      width: 120, height: 180, widthMm: 120, heightMm: 180,
    });
    const product = makeProduct({ elementals: [makeElemental({ label: 'Coală', size: custom })] });
    expect(describeProduct(product)).toBe('120.0 × 180.0 mm · Coală 2 p.');
  });

  it('mentions lamination only when something is actually laminated', () => {
    const plain = makeProduct({ elementals: [makeElemental({ label: 'Coală' })] });
    expect(describeProduct(plain)).toBe('A4 · Coală 2 p.');

    const laminated = makeProduct({
      elementals: [
        makeElemental({
          id: 'e1', label: 'Coală',
          finishing: makeFinishing({ lamination: { type: 'matt', sides: 'both' } }),
        }),
      ],
    });
    expect(describeProduct(laminated)).toBe('A4 · Coală 2 p. · Laminare Mat');
  });

  it('falls back to the catalog label for a product with no elementals', () => {
    expect(describeProduct(makeProduct({ elementals: [] }))).toBe('Broșură A5, Interior 16 Pagini');
  });
});
