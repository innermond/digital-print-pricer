import type { Elemental, Finishing, Paper, Size, Sticker } from '../types';
import type { ProductConfig } from '../data/mockData';

export const makePaper = (overrides: Partial<Paper> = {}): Paper => ({
  kind: 'paper',
  id: 'p5',
  label: '250 GSM - Lucios Premium',
  gsm: 250,
  finish: 'Gloss',
  ...overrides,
});

export const makeSticker = (overrides: Partial<Sticker> = {}): Sticker => ({
  kind: 'sticker',
  id: 'p7',
  label: 'Etichetă Lucioasă Albă',
  gsm: 80,
  face: 'Gloss',
  ...overrides,
});

export const makeSize = (overrides: Partial<Size> = {}): Size => ({
  id: 's1',
  label: 'A4',
  width: 210,
  height: 297,
  unit: 'mm',
  widthMm: 210,
  heightMm: 297,
  ...overrides,
});

export const makeFinishing = (overrides: Partial<Finishing> = {}): Finishing => ({
  lamination: { type: 'none', sides: 'front' },
  folding: { type: 'none', folds: 0 },
  creasing: { count: 0 },
  roundedCornes: { corners: [] },
  ...overrides,
});

export const makeElemental = (overrides: Partial<Elemental> = {}): Elemental => ({
  id: 'elem-test',
  label: 'Coală Simplă',
  media: makePaper(),
  size: makeSize(),
  pageCount: 2,
  printing: { front: 'color', back: 'none' },
  finishing: makeFinishing(),
  ...overrides,
});

export const makeConfig = (overrides: Partial<ProductConfig> = {}): ProductConfig => ({
  allowedMediaIds: ['p2', 'p3'],
  allowedSizeIds: ['s1', 's2'],
  recommendedMediaId: 'p3',
  recommendedSizeId: 's1',
  allowedFoldTypes: ['none'],
  ...overrides,
});
