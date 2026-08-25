import { describe, expect, it } from 'vitest';
import { blankElemental } from './elementals';
import { MOCK_CATALOG } from '../data/catalog';
import { makeConfig, makeElemental } from '../test/fixtures';

const config = makeConfig({
  allowedMediaIds: ['p3', 'p4'],
  allowedSizeIds: ['s1', 's2'],
  recommendedMediaId: 'p4',
  recommendedSizeId: 's2',
});

describe('blankElemental', () => {
  it('seeds media and size from what the config recommends', () => {
    const element = blankElemental(config, MOCK_CATALOG, []);
    expect(element.media.id).toBe('p4');
    expect(element.size.id).toBe('s2');
    // A full Size literal, the way products author it — not just an id.
    expect(element.size.widthMm).toBe(148);
  });

  it('starts neutral, so nothing is finished until it is asked for', () => {
    const element = blankElemental(config, MOCK_CATALOG, []);
    expect(element.pageCount).toBe(2);
    expect(element.printing).toEqual({ front: 'color', back: 'color' });
    expect(element.finishing.lamination.type).toBe('none');
    expect(element.finishing.folding).toEqual({ type: 'none', folds: 0 });
    expect(element.finishing.creasing.count).toBe(0);
    expect(element.finishing.roundedCornes.corners).toEqual([]);
  });

  it('gives every element a globally unique id', () => {
    // updateElemental matches ids across every product, so a collision cross-writes.
    const ids = new Set(Array.from({ length: 50 }, () => blankElemental(config, MOCK_CATALOG, []).id));
    expect(ids.size).toBe(50);
  });

  it('numbers the label from the first free slot', () => {
    const existing = [
      makeElemental({ id: 'a', label: 'Element 1' }),
      makeElemental({ id: 'b', label: 'Element 3' }),
    ];
    // 2 is free, so removing the middle element then adding does not repeat a name.
    expect(blankElemental(config, MOCK_CATALOG, existing).label).toBe('Element 2');
  });

  it('falls back to the first allowed media when the recommendation is not in the catalog', () => {
    const stale = makeConfig({
      allowedMediaIds: ['p3'],
      allowedSizeIds: ['s1'],
      recommendedMediaId: 'p999',
      recommendedSizeId: 's999',
    });
    const element = blankElemental(stale, MOCK_CATALOG, []);
    expect(element.media.id).toBe('p3');
    expect(element.size.id).toBe('s1');
  });
});
