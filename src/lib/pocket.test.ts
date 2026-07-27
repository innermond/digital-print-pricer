import { describe, expect, it } from 'vitest';
import { pocketElemental } from './pocket';
import { MOCK_MEDIA } from '../data/mockData';
import type { Pocket } from '../types';

const pocket: Pocket = {
  label: 'Buzunar de Hârtie',
  mediaId: 'p6',
  width: 200,
  height: 120,
  unit: 'mm',
  pageCount: 2,
  printing: { front: 'black', back: 'none' },
};

describe('pocketElemental', () => {
  it('returns null when the media is not in the catalog', () => {
    expect(pocketElemental({ ...pocket, mediaId: 'nope' }, MOCK_MEDIA)).toBeNull();
  });

  it('rebuilds the pocket as it has always been sent to the price endpoint', () => {
    const elem = pocketElemental(pocket, MOCK_MEDIA)!;
    expect(elem.label).toBe('Buzunar de Hârtie');
    expect(elem.media.id).toBe('p6');
    expect(elem.pageCount).toBe(2);
    expect(elem.printing).toEqual({ front: 'black', back: 'none' });
    expect(elem.size).toMatchObject({ width: 200, height: 120, unit: 'mm' });
  });

  it('carries no finishing — the pocket is never laminated, creased or rounded', () => {
    const elem = pocketElemental(pocket, MOCK_MEDIA)!;
    expect(elem.finishing).toEqual({
      lamination: { type: 'none', sides: 'front' },
      folding: { type: 'none', folds: 0 },
      creasing: { count: 0 },
      roundedCornes: { corners: [] },
    });
  });

  it('converts the millimetre size fields when authored in another unit', () => {
    const inches = pocketElemental({ ...pocket, width: 2, height: 1, unit: 'in' }, MOCK_MEDIA)!;
    expect(inches.size.widthMm).toBeCloseTo(50.8);
    expect(inches.size.heightMm).toBeCloseTo(25.4);
  });
});
