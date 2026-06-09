import type { Paper, Sticker, Media, Size, Product, PrintInk } from '../types';

export const MOCK_PAPERS: Paper[] = [
  { kind: 'paper', id: 'p1', label: '80 GSM - Silk',           gsm: 80,  finish: 'Silk',       explanation: 'Hârtie silk ușoară. Ideală pentru tiraje mari unde costul contează. Culorile sunt vii, dar coala se simte subțire.' },
  { kind: 'paper', id: 'p2', label: '130 GSM - Lucios',        gsm: 130, finish: 'Gloss',      explanation: 'Cea mai populară alegere pentru fluturași și broșuri. Stratul lucios face fotografiile să iasă în evidență și textul să fie clar. Greutate echilibrată — suficient de rezistentă pentru distribuire, suficient de ușoară pentru expediere.' },
  { kind: 'paper', id: 'p3', label: '170 GSM - Mat',           gsm: 170, finish: 'Matt',       explanation: 'Hârtie mat de greutate medie. Reflexia minimă o face ușor de citit în lumină puternică. Se simte mai premium decât lucioasa la aceeași greutate.' },
  { kind: 'paper', id: 'p4', label: '200 GSM - Soft-touch',    gsm: 200, finish: 'Soft-touch', explanation: 'Laminare soft-touch catifelată. Senzație de lux notabilă — excelentă pentru dosare de prezentare și pliante premium. Amprentele se observă mai mult decât pe alte finisaje.' },
  { kind: 'paper', id: 'p5', label: '250 GSM - Lucios Premium',gsm: 250, finish: 'Gloss',      explanation: 'Carton lucios gros, utilizat pentru cărți de vizită și coperte. Își menține forma bine. Luciul ridicat amplifică profunzimea culorilor.' },
  { kind: 'paper', id: 'p6', label: '350 GSM - Mat Premium',   gsm: 350, finish: 'Matt',       explanation: 'Carton mat greu — cea mai groasă opțiune. Ideal pentru cărți de vizită unde doriți o impresie solidă și ponderată. Suprafața mată permite scrierea cu pixul.' },
];

export const MOCK_STICKERS: Sticker[] = [
  { kind: 'sticker', id: 'p7',  label: 'Etichetă Lucioasă Albă', gsm: 80, face: 'Gloss', explanation: 'Material de etichetă alb cu față lucioasă. Cel mai comun material pentru etichete — culorile sunt vii și suprafața este rezistentă la apă.' },
  { kind: 'sticker', id: 'p8',  label: 'Etichetă Mată Albă',     gsm: 80, face: 'Matt',  explanation: 'Material de etichetă alb cu față mată. Ușor de scris și dă un aspect mai curat și discret.' },
  { kind: 'sticker', id: 'p9',  label: 'Etichetă Transparentă',  gsm: 80, face: 'Clear', explanation: 'Etichetă din film transparent. Creează un aspect de „fără etichetă" când este aplicată pe ambalaj — doar tipărirea este vizibilă pe suprafața de dedesubt.' },
  { kind: 'sticker', id: 'p10', label: 'Etichetă Kraft',          gsm: 80, face: 'Kraft', explanation: 'Etichetă din kraft maro neacoperit. Aspect natural, ecologic — populară pentru produse alimentare artizanale, cosmetice și ambalaje handmade.' },
];

export const MOCK_MEDIA: Media[] = [...MOCK_PAPERS, ...MOCK_STICKERS];

export const MOCK_SIZES: Size[] = [
  { id: 's0', label: 'A3',                      width: 297, height: 420, unit: 'mm', widthMm: 297,   heightMm: 420   },
  { id: 's1', label: 'A4',                      width: 210, height: 297, unit: 'mm', widthMm: 210,   heightMm: 297   },
  { id: 's2', label: 'A5',                      width: 148, height: 210, unit: 'mm', widthMm: 148,   heightMm: 210   },
  { id: 's3', label: 'Letter',                  width: 8.5, height: 11,  unit: 'in', widthMm: 215.9, heightMm: 279.4 },
  { id: 's4', label: 'Fluturaș 1/3A4',          width: 100, height: 210, unit: 'mm', widthMm: 100,   heightMm: 210   },
  { id: 's5', label: 'Card Vizită Standard',     width: 90,  height: 50,  unit: 'mm', widthMm: 90,    heightMm: 50    },
  { id: 's6', label: 'Card Vizită Compact',      width: 80,  height: 50,  unit: 'mm', widthMm: 80,    heightMm: 50    },
];

export type PageCountConstraint =
  | { kind: 'derived' }
  | { kind: 'fixed';    value: number }
  | { kind: 'multiple'; of: number; min: number; max: number };

export type ProductConfig = {
  allowedMediaIds: string[];
  allowedSizeIds: string[];
  recommendedMediaId: string;
  recommendedSizeId: string;
  allowedFoldTypes: string[];
  allowedPrintingBacks?: Array<PrintInk | 'none'>;
  elementalPageCounts?: Record<string, PageCountConstraint>;
};

export const PRODUCT_CONFIG: Record<string, ProductConfig> = {
  prod1: {
    allowedMediaIds: ['p1', 'p2', 'p3', 'p4'],
    allowedSizeIds: ['s4', 's3', 's2', 's1'],
    recommendedMediaId: 'p2',
    recommendedSizeId: 's4',
    allowedFoldTypes: ['none'],
  },
  prod2: {
    allowedMediaIds: ['p2', 'p3', 'p4', 'p5'],
    allowedSizeIds: ['s1', 's2'],
    recommendedMediaId: 'p3',
    recommendedSizeId: 's1',
    allowedFoldTypes: ['none', 'half-fold'],
    elementalPageCounts: {
      'elem2-1': { kind: 'derived' },
      'elem2-2': { kind: 'multiple', of: 4, min: 4, max: 64 },
    },
  },
  prod3: {
    allowedMediaIds: ['p6'],
    allowedSizeIds: ['s1'],
    recommendedMediaId: 'p6',
    recommendedSizeId: 's1',
    allowedFoldTypes: ['none'],
  },
  prod4: {
    allowedMediaIds: ['p5', 'p6'],
    allowedSizeIds: ['s5', 's6'],
    recommendedMediaId: 'p6',
    recommendedSizeId: 's5',
    allowedFoldTypes: ['none'],
  },
  prod5: {
    allowedMediaIds: ['p1', 'p2', 'p3', 'p4'],
    allowedSizeIds: ['s1', 's2', 's4'],
    recommendedMediaId: 'p2',
    recommendedSizeId: 's4',
    allowedFoldTypes: ['half-fold', 'tri-fold', 'z-fold', 'gate-fold'],
    elementalPageCounts: {
      'elem5-1': { kind: 'derived' },
    },
  },
  prod6: {
    allowedMediaIds: ['p7', 'p8', 'p9', 'p10'],
    allowedSizeIds: ['s0', 's1', 's2'],
    recommendedMediaId: 'p7',
    recommendedSizeId: 's1',
    allowedFoldTypes: ['none'],
    allowedPrintingBacks: ['none'],
    elementalPageCounts: {
      'elem6-1': { kind: 'fixed', value: 1 },
    },
  },
  prod7: { // Spiral Catalog
    allowedMediaIds: ['p2', 'p3', 'p4', 'p5'],
    allowedSizeIds: ['s1', 's2'],
    recommendedMediaId: 'p3',
    recommendedSizeId: 's1',
    allowedFoldTypes: ['none'],
    elementalPageCounts: {
      'elem7-1': { kind: 'fixed', value: 2 },
      'elem7-2': { kind: 'multiple', of: 2, min: 2, max: 200 },
    },
  },
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    label: 'Fluturaș',
    amount: 1,
    elementals: [
      {
        id: 'elem1-1',
        label: 'Coală Simplă',
        media: MOCK_PAPERS[1],
        size: { id: 's4', label: 'Fluturaș', width: 100, height: 200, unit: 'mm', widthMm: 100, heightMm: 200 },
        pageCount: 2,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod2',
    label: 'Broșură (Tri-fold)',
    amount: 1,
    elementals: [
      {
        id: 'elem2-1',
        label: 'Copertă',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 4,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'gloss', sides: 'both' },
          folding: { type: 'half-fold', folds: 1 },
          creasing: { count: 1 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem2-2',
        label: 'Interior',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 8,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'half-fold', folds: 1 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod3',
    label: 'Dosar de Prezentare',
    amount: 1,
    elementals: [
      {
        id: 'elem3-1',
        label: 'Coală A3 Pliată',
        media: MOCK_PAPERS[3],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 2,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'soft-touch', sides: 'both' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 2 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem3-2',
        label: 'Buzunar de Hârtie',
        media: MOCK_PAPERS[5],
        size: { id: 's999', label: 'Pers.', width: 200, height: 120, unit: 'mm', widthMm: 200, heightMm: 120 },
        pageCount: 2,
        printing: { front: 'black', back: 'none' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod4',
    label: 'Card de Vizită',
    amount: 1,
    elementals: [
      {
        id: 'elem4-1',
        label: 'Card de Vizită',
        media: MOCK_PAPERS[5],
        size: { id: 's5', label: 'Card Vizită Standard', width: 90, height: 50, unit: 'mm', widthMm: 90, heightMm: 50 },
        pageCount: 2,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod5',
    label: 'Pliant Pliat',
    amount: 1,
    elementals: [
      {
        id: 'elem5-1',
        label: 'Coală',
        media: MOCK_PAPERS[1],
        size: { id: 's4', label: 'Fluturaș 1/3A4', width: 100, height: 210, unit: 'mm', widthMm: 100, heightMm: 210 },
        pageCount: 6,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'tri-fold', folds: 2 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod6',
    label: 'Etichetă pe Coală',
    amount: 1,
    elementals: [
      {
        id: 'elem6-1',
        label: 'Coală de Etichete',
        media: MOCK_STICKERS[0],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 1,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod7',
    label: 'Catalog cu spira',
    amount: 1,
    elementals: [
      {
        id: 'elem7-1',
        label: 'Copertă',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 2,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'gloss', sides: 'both' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem7-2',
        label: 'Interior',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 16,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
];
