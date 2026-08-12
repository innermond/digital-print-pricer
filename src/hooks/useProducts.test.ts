import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProducts } from './useProducts';
import { MOCK_CATALOG } from '../data/catalog';

// prod9's cover carries a catalog-owned creasing cap; the rest of the elemental
// is the user's own selection.
const COVER = () => {
  const product = MOCK_CATALOG.products.find((p) => p.id === 'prod9')!;
  const cover = product.elementals[0];
  // Guard against the suite going vacuous: every assertion below compares
  // against this cap, so undefined === undefined would pass for the wrong reason.
  expect(cover.finishing.creasing.max, 'prod9 cover must carry a creasing cap').toBeDefined();
  return { product, cover };
};

const seedCache = (mutate: (products: unknown) => void) => {
  const products = JSON.parse(JSON.stringify(MOCK_CATALOG.products));
  mutate(products);
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('products_version', 'v3');
};

const load = () =>
  renderHook(() => useProducts({ catalog: MOCK_CATALOG, persist: true })).result.current.products;

describe('useProducts — catalog constraints vs cached selections', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('seeds from the catalog when there is no cache', () => {
    const { cover } = COVER();
    const loaded = load().find((p) => p.id === 'prod9')!;
    expect(loaded.elementals[0].finishing.creasing.max).toBe(cover.finishing.creasing.max);
  });

  it('refreshes a creasing cap that the cache predates', () => {
    // A cache written before the cap was authored: the selection is there, the
    // constraint is not. Reading it back verbatim made catalog edits look inert.
    seedCache((products) => {
      const p9 = (products as { id: string; elementals: { finishing: { creasing: Record<string, unknown> } }[] }[])
        .find((p) => p.id === 'prod9')!;
      delete p9.elementals[0].finishing.creasing.max;
    });

    const { cover } = COVER();
    const loaded = load().find((p) => p.id === 'prod9')!;
    expect(loaded.elementals[0].finishing.creasing.max).toBe(cover.finishing.creasing.max);
  });

  it('overwrites a cap the cache disagrees with, rather than trusting the cache', () => {
    seedCache((products) => {
      const p9 = (products as { id: string; elementals: { finishing: { creasing: { max?: number } } }[] }[])
        .find((p) => p.id === 'prod9')!;
      p9.elementals[0].finishing.creasing.max = 99;
    });

    const { cover } = COVER();
    const loaded = load().find((p) => p.id === 'prod9')!;
    expect(loaded.elementals[0].finishing.creasing.max).toBe(cover.finishing.creasing.max);
    expect(loaded.elementals[0].finishing.creasing.max).not.toBe(99);
  });

  it('keeps the user’s own choices, including the chosen crease count', () => {
    seedCache((products) => {
      const p9 = (products as {
        id: string;
        amount: number;
        elementals: { finishing: { creasing: { count: number; max?: number } } }[];
      }[]).find((p) => p.id === 'prod9')!;
      p9.amount = 7;
      p9.elementals[0].finishing.creasing.count = 2;
      delete p9.elementals[0].finishing.creasing.max;
    });

    const loaded = load().find((p) => p.id === 'prod9')!;
    expect(loaded.amount).toBe(7);
    expect(loaded.elementals[0].finishing.creasing.count).toBe(2);
  });

  it('leaves products the catalog no longer has alone', () => {
    seedCache((products) => {
      (products as { id: string }[]).push({
        ...JSON.parse(JSON.stringify(MOCK_CATALOG.products[0])),
        id: 'imported-only',
      });
    });

    expect(load().some((p) => p.id === 'imported-only')).toBe(true);
  });
});
