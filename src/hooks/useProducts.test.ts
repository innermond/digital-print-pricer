import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useProducts } from './useProducts';
import { MOCK_CATALOG } from '../data/catalog';

// prod3a's cover carries a catalog-owned creasing cap; the rest of the elemental
// is the user's own selection.
const COVER = () => {
  const product = MOCK_CATALOG.products.find((p) => p.id === 'prod3a')!;
  const cover = product.elementals[0];
  // Guard against the suite going vacuous: every assertion below compares
  // against this cap, so undefined === undefined would pass for the wrong reason.
  expect(cover.finishing.creasing.max, 'prod3a cover must carry a creasing cap').toBeDefined();
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
    const loaded = load().find((p) => p.id === 'prod3a')!;
    expect(loaded.elementals[0].finishing.creasing.max).toBe(cover.finishing.creasing.max);
  });

  it('refreshes a creasing cap that the cache predates', () => {
    // A cache written before the cap was authored: the selection is there, the
    // constraint is not. Reading it back verbatim made catalog edits look inert.
    seedCache((products) => {
      const p3a = (products as { id: string; elementals: { finishing: { creasing: Record<string, unknown> } }[] }[])
        .find((p) => p.id === 'prod3a')!;
      delete p3a.elementals[0].finishing.creasing.max;
    });

    const { cover } = COVER();
    const loaded = load().find((p) => p.id === 'prod3a')!;
    expect(loaded.elementals[0].finishing.creasing.max).toBe(cover.finishing.creasing.max);
  });

  it('overwrites a cap the cache disagrees with, rather than trusting the cache', () => {
    seedCache((products) => {
      const p3a = (products as { id: string; elementals: { finishing: { creasing: { max?: number } } }[] }[])
        .find((p) => p.id === 'prod3a')!;
      p3a.elementals[0].finishing.creasing.max = 99;
    });

    const { cover } = COVER();
    const loaded = load().find((p) => p.id === 'prod3a')!;
    expect(loaded.elementals[0].finishing.creasing.max).toBe(cover.finishing.creasing.max);
    expect(loaded.elementals[0].finishing.creasing.max).not.toBe(99);
  });

  it('keeps the user’s own choices, including the chosen crease count', () => {
    seedCache((products) => {
      const p3a = (products as {
        id: string;
        amount: number;
        elementals: { finishing: { creasing: { count: number; max?: number } } }[];
      }[]).find((p) => p.id === 'prod3a')!;
      p3a.amount = 7;
      p3a.elementals[0].finishing.creasing.count = 2;
      delete p3a.elementals[0].finishing.creasing.max;
    });

    const loaded = load().find((p) => p.id === 'prod3a')!;
    expect(loaded.amount).toBe(7);
    expect(loaded.elementals[0].finishing.creasing.count).toBe(2);
  });

  it('picks up a product the catalog has gained since the cache was written', () => {
    // Without this the only cure is bumping STORAGE_VERSION, which throws away
    // every local edit — so a new catalog product would read "0 variante" for
    // anyone who had ever opened the app.
    seedCache((products) => {
      const list = products as { id: string }[];
      const index = list.findIndex((p) => p.id === 'prod2a');
      list.splice(index, 1);
    });

    const loaded = load();
    expect(loaded.some((p) => p.id === 'prod2a')).toBe(true);
    expect(loaded).toHaveLength(MOCK_CATALOG.products.length);
  });

  it('keeps the cached selections when appending a new catalog product', () => {
    seedCache((products) => {
      const list = products as { id: string; amount: number }[];
      list.find((p) => p.id === 'prod3a')!.amount = 42;
      list.splice(list.findIndex((p) => p.id === 'prod2a'), 1);
    });

    const loaded = load();
    expect(loaded.find((p) => p.id === 'prod3a')!.amount).toBe(42);
    expect(loaded.some((p) => p.id === 'prod2a')).toBe(true);
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

describe('useProducts — adding and removing elements', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  const render = () => renderHook(() => useProducts({ catalog: MOCK_CATALOG, persist: false }));
  const find = (result: { current: { products: typeof MOCK_CATALOG.products } }, id: string) =>
    result.current.products.find((p) => p.id === id)!;

  it('appends a blank element to a product that allows editing', () => {
    const { result } = render();
    expect(find(result, 'prodGa').elementals).toHaveLength(1);

    let added;
    act(() => { added = result.current.addElemental('prodGa'); });

    const elementals = find(result, 'prodGa').elementals;
    expect(elementals).toHaveLength(2);
    expect(elementals[1].id).toBe(added!.id);
    // Returned so the caller can move the tab selection onto the new element.
    expect(added!.label).toBe('Element 2');
  });

  it('refuses to add to a product that does not allow editing', () => {
    const { result } = render();
    const before = find(result, 'prod2a').elementals.length;

    let added;
    act(() => { added = result.current.addElemental('prod2a'); });

    expect(added).toBeUndefined();
    expect(find(result, 'prod2a').elementals).toHaveLength(before);
  });

  it('removes an element by id', () => {
    const { result } = render();
    act(() => { result.current.addElemental('prodGa'); });
    const doomed = find(result, 'prodGa').elementals[1].id;

    act(() => { result.current.removeElemental('prodGa', doomed); });

    expect(find(result, 'prodGa').elementals.map((e) => e.id)).not.toContain(doomed);
  });

  it('never removes the last element, which would leave nothing to price', () => {
    const { result } = render();
    const only = find(result, 'prodGa').elementals[0].id;

    act(() => { result.current.removeElemental('prodGa', only); });

    expect(find(result, 'prodGa').elementals).toHaveLength(1);
  });

  it('marks the product personalized once an element is added, and reverts it away', () => {
    const { result } = render();
    act(() => { result.current.addElemental('prodGa'); });
    expect(result.current.isPersonalized(find(result, 'prodGa'))).toBe(true);

    act(() => { result.current.revertProduct('prodGa'); });
    expect(find(result, 'prodGa').elementals).toHaveLength(1);
  });
});
