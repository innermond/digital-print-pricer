import type { Paper, Size, Product } from '../types';

export const MOCK_PAPERS: Paper[] = [
  { id: 'p1', label: '80 GSM - Silk', gsm: 80, finish: 'Silk', explanation: 'Lightweight silk-coated stock. Good for high-volume runs where cost matters. Colours are vivid but the sheet feels thin.' },
  { id: 'p2', label: '130 GSM - Gloss', gsm: 130, finish: 'Gloss', explanation: 'The most popular choice for flyers and brochures. Gloss coating makes photos pop and text sharp. Balanced weight — sturdy enough to hand out, light enough to post.' },
  { id: 'p3', label: '170 GSM - Matt', gsm: 170, finish: 'Matt', explanation: 'Medium-weight matt stock. Minimal glare makes it easy to read under bright light. Feels more premium than gloss at the same weight.' },
  { id: 'p4', label: '200 GSM - Soft-touch', gsm: 200, finish: 'Soft-touch', explanation: 'Velvet-like soft-touch laminate. Noticeably luxurious feel — great for presentation folders and premium leaflets. Fingerprints show more than other finishes.' },
  { id: 'p5', label: '250 GSM - Gloss (Premium)', gsm: 250, finish: 'Gloss', explanation: 'Thick gloss board used for business cards and covers. Holds its shape well. High gloss amplifies colour depth.' },
  { id: 'p6', label: '350 GSM - Matt (Premium)', gsm: 350, finish: 'Matt', explanation: 'Heavyweight matt board — the thickest option. Ideal for business cards where you want a solid, weighty impression. Matt surface is pen-friendly for handwritten notes.' },
];

export const MOCK_SIZES: Size[] = [
  { id: 's0', label: 'A3',                    width: 297, height: 420, unit: 'mm', widthMm: 297,   heightMm: 420   },
  { id: 's1', label: 'A4',                    width: 210, height: 297, unit: 'mm', widthMm: 210,   heightMm: 297   },
  { id: 's2', label: 'A5',                    width: 148, height: 210, unit: 'mm', widthMm: 148,   heightMm: 210   },
  { id: 's3', label: 'Letter',                width: 8.5, height: 11,  unit: 'in', widthMm: 215.9, heightMm: 279.4 },
  { id: 's4', label: 'Flyer 1/3A4',           width: 100, height: 210, unit: 'mm', widthMm: 100,   heightMm: 210   },
  { id: 's5', label: 'Business Card Classic', width: 90,  height: 50,  unit: 'mm', widthMm: 90,    heightMm: 50    },
  { id: 's6', label: 'Business Card Compact', width: 80,  height: 50,  unit: 'mm', widthMm: 80,    heightMm: 50    },
];

export type ProductConfig = {
  allowedPaperIds: string[];
  allowedSizeIds: string[];
  recommendedPaperId: string;
  recommendedSizeId: string;
  allowedFoldTypes: string[];
};

// Product configuration: what options are valid for each product
export const PRODUCT_CONFIG: Record<string, ProductConfig> = {
  prod1: { // Flyer
    allowedPaperIds: ['p1', 'p2', 'p3', 'p4'],
    allowedSizeIds: ['s4', 's3', 's2', 's1'],
    recommendedPaperId: 'p2',
    recommendedSizeId: 's4',
    allowedFoldTypes: ['none'],
  },
  prod2: { // Brochure
    allowedPaperIds: ['p2', 'p3', 'p4', 'p5'],
    allowedSizeIds: ['s1', 's2'],
    recommendedPaperId: 'p3',
    recommendedSizeId: 's1',
    allowedFoldTypes: ['none', 'half-fold'],
  },
  prod3: { // Presentation Folder
    allowedPaperIds: ['p6'],
    allowedSizeIds: ['s1'],
    recommendedPaperId: 'p6',
    recommendedSizeId: 's1',
    allowedFoldTypes: ['none'],
  },
  prod4: { // Business card
    allowedPaperIds: ['p5', 'p6'],
    allowedSizeIds: ['s5', 's6'],
    recommendedPaperId: 'p6',
    recommendedSizeId: 's5',
    allowedFoldTypes: ['none'],
  },
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    label: 'Flyer',
    amount: 1,
    elementals: [
      {
        id: 'elem1-1',
        label: 'Single Sheet',
        paper: MOCK_PAPERS[1],
        size: { id: 's4', label: 'Flyer', width: 100, height: 200, unit: 'mm', widthMm: 100, heightMm: 200 },
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
    label: 'Brochure (Tri-fold)',
    amount: 1,
    elementals: [
      {
        id: 'elem2-1',
        label: 'Cover',
        paper: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
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
        paper: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'half-fold', folds: 1 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem2-3',
        label: 'Back Cover',
        paper: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        finishing: {
          lamination: { type: 'matt', sides: 'back' },
          folding: { type: 'tri-fold', folds: 2 },
          creasing: { count: 1 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod3',
    label: 'Presentation Folder',
    amount: 1,
    elementals: [
      {
        id: 'elem3-1',
        label: 'Folded A3 sheet',
        paper: MOCK_PAPERS[3],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        finishing: {
          lamination: { type: 'soft-touch', sides: 'both' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 2 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem3-2',
        label: 'Paper Pocket',
        paper: MOCK_PAPERS[5],
        size: { id: 's999', label: 'Cust', width: 200, height: 120, unit: 'mm', widthMm: 200, heightMm: 120 },
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
    label: 'Business Card',
    amount: 1,
    elementals: [
      {
        id: 'elem4-1',
        label: 'Business card',
        paper: MOCK_PAPERS[5],
        size: { id: 's5', label: 'Business Card Classic', width: 90, height: 50, unit: 'mm', widthMm: 90, heightMm: 50 },
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
