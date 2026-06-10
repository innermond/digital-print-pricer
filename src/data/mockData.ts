import type { Paper, Sticker, Media, Size, Product, ProductCategory, PrintInk, BindingType, SpiralColor, Staple } from '../types';

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
  { id: 's4', label: '1/3A4',          width: 100, height: 210, unit: 'mm', widthMm: 100,   heightMm: 210   },
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
  allowedPrintingFronts?: Array<PrintInk | 'none'>;
  allowedPrintingBacks?: Array<PrintInk | 'none'>;
  elementalPrintingFronts?: Record<string, Array<PrintInk | 'none'>>;
  elementalPrintingBacks?: Record<string, Array<PrintInk | 'none'>>;
  elementalPageCounts?: Record<string, PageCountConstraint>;
  binding?: { type: BindingType; allowedColors?: SpiralColor[] };
  allowedStaple?: Staple;
  explanation?: string;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'flyer', label: 'Fluturaș', explanation: 'Materiale tipărite pe o singură coală, distribuite în masă — promoții, evenimente, anunțuri.' },
  { id: 'brochure', label: 'Broșură', explanation: 'Materiale pliate cu copertă și interior, pentru cataloage și prezentări.' },
  { id: 'folder', label: 'Dosar de Prezentare', explanation: 'Dosare din carton gros cu buzunar interior, pentru oferte și prezentări.' },
  { id: 'business-card', label: 'Card de Vizită', explanation: 'Carduri de vizită clasice, tipărite pe carton rezistent.' },
  { id: 'folded-flyer', label: 'Pliant Pliat', explanation: 'Pliante cu mai multe panouri, obținute prin pliere dintr-o singură coală.' },
  { id: 'sticker-sheet', label: 'Etichetă pe Coală', explanation: 'Coli de etichete autoadezive, decupate individual după tipărire.' },
  { id: 'spiral-catalog', label: 'Catalog cu spira', explanation: 'Cataloage legate cu spirală, cu copertă, interior multi-pagină și copertă spate.' },
  { id: 'cardboard-label', label: 'Etichetă Carton', explanation: 'Etichete din carton gros, cu opțiune de gaură pentru agățare și/sau capsă.' },
  { id: 'calendar', label: 'Calendar', explanation: 'Calendare de perete legate cu spirală, cu file lunare.' },
];

// Shared constraints for the "flyer" category — presets within this category only
// differ by their initial elemental selections (media/size/printing), not by what's allowed.
const FLYER_CATEGORY_CONFIG: Pick<ProductConfig, 'allowedMediaIds' | 'allowedSizeIds' | 'allowedFoldTypes'> = {
  allowedMediaIds: ['p1', 'p2', 'p3', 'p4'],
  allowedSizeIds: ['s4', 's3', 's2', 's1'],
  allowedFoldTypes: ['none'],
};

// Shared constraints for the "brochure" category — presets within this category only
// differ by their interior page count.
const BROCHURE_CATEGORY_CONFIG: Pick<ProductConfig, 'allowedMediaIds' | 'allowedSizeIds' | 'recommendedMediaId' | 'recommendedSizeId' | 'allowedFoldTypes'> = {
  allowedMediaIds: ['p2', 'p3', 'p4', 'p5'],
  allowedSizeIds: ['s1', 's2'],
  recommendedMediaId: 'p3',
  recommendedSizeId: 's1',
  allowedFoldTypes: ['none', 'half-fold'],
};

// Shared constraints for the "folder" category — presets within this category only
// differ by whether the inner paper pocket is included.
const FOLDER_CATEGORY_CONFIG: Pick<ProductConfig, 'allowedMediaIds' | 'allowedSizeIds' | 'recommendedMediaId' | 'recommendedSizeId' | 'allowedFoldTypes'> = {
  allowedMediaIds: ['p6'],
  allowedSizeIds: ['s1'],
  recommendedMediaId: 'p6',
  recommendedSizeId: 's1',
  allowedFoldTypes: ['none'],
};

// Shared constraints for the "business-card" category — presets within this category only
// differ by their initial size and printing selections.
const BUSINESS_CARD_CATEGORY_CONFIG: Pick<ProductConfig, 'allowedMediaIds' | 'allowedSizeIds' | 'recommendedMediaId' | 'allowedFoldTypes'> = {
  allowedMediaIds: ['p5', 'p6'],
  allowedSizeIds: ['s5', 's6'],
  recommendedMediaId: 'p6',
  allowedFoldTypes: ['none'],
};

// Shared constraints for the "folded-flyer" category — presets within this category only
// differ by their initial fold type and panel count.
const FOLDED_FLYER_CATEGORY_CONFIG: Pick<ProductConfig, 'allowedMediaIds' | 'allowedSizeIds' | 'recommendedMediaId' | 'recommendedSizeId' | 'allowedFoldTypes'> = {
  allowedMediaIds: ['p1', 'p2', 'p3', 'p4'],
  allowedSizeIds: ['s1', 's2', 's4'],
  recommendedMediaId: 'p2',
  recommendedSizeId: 's4',
  allowedFoldTypes: ['half-fold', 'tri-fold', 'z-fold', 'gate-fold'],
};

// Shared constraints for the "sticker-sheet" category — presets within this category only
// differ by their initial media (face finish) and size.
const STICKER_SHEET_CATEGORY_CONFIG: Pick<ProductConfig, 'allowedMediaIds' | 'allowedSizeIds' | 'recommendedMediaId' | 'recommendedSizeId' | 'allowedFoldTypes' | 'allowedPrintingBacks'> = {
  allowedMediaIds: ['p7', 'p8', 'p9', 'p10'],
  allowedSizeIds: ['s0', 's1', 's2'],
  recommendedMediaId: 'p7',
  recommendedSizeId: 's1',
  allowedFoldTypes: ['none'],
  allowedPrintingBacks: ['none'],
};

// Shared constraints for the "spiral-catalog" category — presets within this category only
// differ by their interior page count.
const SPIRAL_CATALOG_CATEGORY_CONFIG: Pick<ProductConfig, 'allowedMediaIds' | 'allowedSizeIds' | 'recommendedMediaId' | 'recommendedSizeId' | 'allowedFoldTypes' | 'binding'> = {
  allowedMediaIds: ['p2', 'p3', 'p4', 'p5'],
  allowedSizeIds: ['s1', 's2'],
  recommendedMediaId: 'p3',
  recommendedSizeId: 's1',
  allowedFoldTypes: ['none'],
  binding: { type: 'spiral', allowedColors: ['white', 'black'] },
};

// Shared constraints for the "cardboard-label" category — presets within this category only
// differ by their initial size and staple selection.
const CARDBOARD_LABEL_CATEGORY_CONFIG: Pick<ProductConfig, 'allowedMediaIds' | 'allowedSizeIds' | 'recommendedMediaId' | 'allowedFoldTypes' | 'allowedStaple'> = {
  allowedMediaIds: ['p5', 'p6'],
  allowedSizeIds: ['s5', 's6'],
  recommendedMediaId: 'p6',
  allowedFoldTypes: ['none'],
  allowedStaple: { hole: true, staple: true },
};

export const PRODUCT_CONFIG: Record<string, ProductConfig> = {
  prod1a: {
    ...FLYER_CATEGORY_CONFIG,
    recommendedMediaId: 'p2',
    recommendedSizeId: 's1',
    explanation: 'Coală A4 tipărită color pe ambele fețe. Ideală pentru fluturași cu mesaj complet pe ambele fețe — evenimente, promoții, materiale informative.',
  },
  prod1b: {
    ...FLYER_CATEGORY_CONFIG,
    recommendedMediaId: 'p1',
    recommendedSizeId: 's4',
    explanation: 'Fluturaș 1/3A4 tipărit alb-negru pe o singură față. Cea mai economică variantă pentru distribuire în masă — costuri minime de tipărire.',
  },
  prod1c: {
    ...FLYER_CATEGORY_CONFIG,
    recommendedMediaId: 'p2',
    recommendedSizeId: 's2',
    explanation: 'Coală A5 tipărită color pe ambele fețe. Format compact ideal pentru pliante de mână, meniuri sau invitații.',
  },
  prod1d: {
    ...FLYER_CATEGORY_CONFIG,
    recommendedMediaId: 'p3',
    recommendedSizeId: 's1',
    explanation: 'Coală A4 tipărită color doar pe față. Potrivit pentru afișe simple sau anunțuri unde versoul rămâne neutilizat.',
  },
  prod1e: {
    ...FLYER_CATEGORY_CONFIG,
    recommendedMediaId: 'p2',
    recommendedSizeId: 's3',
    explanation: 'Coală format Letter (US) tipărită color pe ambele fețe. Recomandat pentru materiale destinate pieței nord-americane.',
  },
  prod2a: {
    ...BROCHURE_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem2a-1': { kind: 'derived' },
      'elem2a-2': { kind: 'multiple', of: 4, min: 4, max: 64 },
    },
    explanation: 'Broșură pliată cu copertă și interior de 8 pagini. Potrivită pentru cataloage subțiri, prezentări de produse sau materiale promoționale concise.',
  },
  prod2b: {
    ...BROCHURE_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem2b-1': { kind: 'derived' },
      'elem2b-2': { kind: 'multiple', of: 4, min: 4, max: 64 },
    },
    explanation: 'Broșură pliată cu copertă și interior de 16 pagini. Potrivită pentru cataloage de produse cu mai multe categorii sau prezentări detaliate.',
  },
  prod2c: {
    ...BROCHURE_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem2c-1': { kind: 'derived' },
      'elem2c-2': { kind: 'multiple', of: 4, min: 4, max: 64 },
    },
    explanation: 'Broșură pliată cu copertă și interior de 32 pagini. Potrivită pentru cataloage extinse, manuale sau portofolii de produse.',
  },
  prod2d: {
    ...BROCHURE_CATEGORY_CONFIG,
    recommendedSizeId: 's2',
    elementalPageCounts: {
      'elem2d-1': { kind: 'derived' },
      'elem2d-2': { kind: 'multiple', of: 4, min: 4, max: 64 },
    },
    explanation: 'Broșură pliată format A5, cu copertă și interior de 8 pagini. Variantă compactă pentru pliante de buzunar sau ghiduri mici.',
  },
  prod2e: {
    ...BROCHURE_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem2e-1': { kind: 'derived' },
      'elem2e-2': { kind: 'multiple', of: 4, min: 4, max: 64 },
    },
    explanation: 'Broșură pliată cu copertă și interior de 24 pagini. Echilibru între volum și cost — potrivită pentru cataloage de dimensiuni medii.',
  },
  prod3a: {
    ...FOLDER_CATEGORY_CONFIG,
    explanation: 'Dosar de prezentare din carton gros, cu buzunar interior pentru documente. Folosit pentru oferte comerciale, dosare de candidatură sau materiale de prezentare premium.',
  },
  prod3b: {
    ...FOLDER_CATEGORY_CONFIG,
    explanation: 'Dosar de prezentare simplu din carton gros, fără buzunar interior. Variantă mai economică pentru materiale de prezentare de bază.',
  },
  prod3c: {
    ...FOLDER_CATEGORY_CONFIG,
    explanation: 'Dosar de prezentare cu buzunar interior și bandă elastică de închidere. Protejează conținutul în timpul transportului — potrivit pentru dosare de candidatură sau materiale care circulă des.',
  },
  prod3d: {
    ...FOLDER_CATEGORY_CONFIG,
    explanation: 'Dosar de prezentare cu buzunar interior și laminare lucioasă pe copertă. Aspect strălucitor, premium — recomandat pentru materiale de marketing care trebuie să atragă atenția.',
  },
  prod3e: {
    ...FOLDER_CATEGORY_CONFIG,
    explanation: 'Dosar de prezentare simplu, cu laminare mată pe copertă, fără buzunar interior. Aspect discret și elegant pentru documente oficiale.',
  },
  prod4a: {
    ...BUSINESS_CARD_CATEGORY_CONFIG,
    recommendedSizeId: 's5',
    explanation: 'Card de vizită standard 90x50mm, tipărit pe ambele fețe pe carton rezistent. Esențial pentru identitatea de afaceri și networking.',
  },
  prod4b: {
    ...BUSINESS_CARD_CATEGORY_CONFIG,
    recommendedSizeId: 's6',
    explanation: 'Card de vizită compact 80x50mm, tipărit pe o singură față. Variantă mai economică pentru tiraje mari.',
  },
  prod4c: {
    ...BUSINESS_CARD_CATEGORY_CONFIG,
    recommendedMediaId: 'p5',
    recommendedSizeId: 's5',
    explanation: 'Card de vizită premium 90x50mm pe carton lucios 250gsm, laminat pe ambele fețe. Aspect strălucitor și rezistență sporită — pentru profesioniști care vor să iasă în evidență.',
  },
  prod4d: {
    ...BUSINESS_CARD_CATEGORY_CONFIG,
    recommendedSizeId: 's5',
    explanation: 'Card de vizită standard 90x50mm, tipărit doar pe față, cu finisaj soft-touch catifelat. Senzație tactilă premium pentru o primă impresie memorabilă.',
  },
  prod4e: {
    ...BUSINESS_CARD_CATEGORY_CONFIG,
    recommendedSizeId: 's6',
    explanation: 'Card de vizită compact 80x50mm, tipărit pe ambele fețe. Permite mai multe informații de contact pe un format redus, la cost moderat.',
  },
  prod5a: {
    ...FOLDED_FLYER_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem5a-1': { kind: 'derived' },
    },
    explanation: 'Pliant cu pliere în 3 (tri-fold), obținut dintr-o singură coală. Excelent pentru hărți, ghiduri sau prezentări de produse cu mai multe secțiuni.',
  },
  prod5b: {
    ...FOLDED_FLYER_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem5b-1': { kind: 'derived' },
    },
    explanation: 'Pliant cu pliere în Z (z-fold), obținut dintr-o singură coală. Potrivit pentru prezentări secvențiale sau hărți pliate.',
  },
  prod5c: {
    ...FOLDED_FLYER_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem5c-1': { kind: 'derived' },
    },
    explanation: 'Pliant cu pliere simplă în 2 (bi-fold), obținut dintr-o singură coală. Variantă compactă pentru mesaje scurte.',
  },
  prod5d: {
    ...FOLDED_FLYER_CATEGORY_CONFIG,
    recommendedSizeId: 's1',
    elementalPageCounts: {
      'elem5d-1': { kind: 'derived' },
    },
    explanation: 'Pliant format A4 cu pliere tip portiță (gate-fold), care se deschide spre interior din ambele laturi. Creează un efect spectaculos pentru lansări de produse sau meniuri de lux.',
  },
  prod5e: {
    ...FOLDED_FLYER_CATEGORY_CONFIG,
    recommendedMediaId: 'p3',
    recommendedSizeId: 's1',
    elementalPageCounts: {
      'elem5e-1': { kind: 'derived' },
    },
    explanation: 'Pliant format A4 cu pliere în 3 (tri-fold), mai mare decât varianta 1/3A4. Spațiu generos pentru text și imagini — potrivit pentru prezentări de servicii complexe.',
  },
  prod6a: {
    ...STICKER_SHEET_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem6a-1': { kind: 'fixed', value: 1 },
    },
    explanation: 'Coală A4 de etichete autoadezive lucioase, tipărită pe o singură față. Potrivită pentru ambalaje, sticle sau organizare — se decupează individual după tipărire.',
  },
  prod6b: {
    ...STICKER_SHEET_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem6b-1': { kind: 'fixed', value: 1 },
    },
    explanation: 'Coală A3 de etichete autoadezive mate, tipărită pe o singură față. Potrivită pentru tiraje mari de etichete decupate individual.',
  },
  prod6c: {
    ...STICKER_SHEET_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem6c-1': { kind: 'fixed', value: 1 },
    },
    explanation: 'Coală A4 de etichete transparente, tipărită pe o singură față. Creează un aspect „fără etichetă" — ideală pentru ambalaje premium.',
  },
  prod6d: {
    ...STICKER_SHEET_CATEGORY_CONFIG,
    recommendedMediaId: 'p10',
    recommendedSizeId: 's2',
    elementalPageCounts: {
      'elem6d-1': { kind: 'fixed', value: 1 },
    },
    explanation: 'Coală A5 de etichete kraft, tipărită pe o singură față. Aspect natural, ecologic — potrivit pentru produse artizanale sau organice.',
  },
  prod6e: {
    ...STICKER_SHEET_CATEGORY_CONFIG,
    recommendedMediaId: 'p7',
    recommendedSizeId: 's0',
    elementalPageCounts: {
      'elem6e-1': { kind: 'fixed', value: 1 },
    },
    explanation: 'Coală A3 de etichete autoadezive lucioase, tipărită pe o singură față. Format mare pentru tiraje de volum sau decupaje complexe cu multe etichete pe coală.',
  },
  prod7a: {
    ...SPIRAL_CATALOG_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem7a-1': { kind: 'fixed', value: 1 },
      'elem7a-2': { kind: 'multiple', of: 2, min: 2, max: 200 },
      'elem7a-3': { kind: 'fixed', value: 1 },
    },
    explanation: 'Catalog cu copertă, interior de 16 pagini și copertă spate, legat cu spirală. Ideal pentru cataloage subțiri de produse sau portofolii compacte.',
  },
  prod7b: {
    ...SPIRAL_CATALOG_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem7b-1': { kind: 'fixed', value: 1 },
      'elem7b-2': { kind: 'multiple', of: 2, min: 2, max: 200 },
      'elem7b-3': { kind: 'fixed', value: 1 },
    },
    explanation: 'Catalog cu copertă, interior de 32 pagini și copertă spate, legat cu spirală. Potrivit pentru cataloage de produse cu game extinse.',
  },
  prod7c: {
    ...SPIRAL_CATALOG_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem7c-1': { kind: 'fixed', value: 1 },
      'elem7c-2': { kind: 'multiple', of: 2, min: 2, max: 200 },
      'elem7c-3': { kind: 'fixed', value: 1 },
    },
    explanation: 'Catalog cu copertă, interior de 48 pagini și copertă spate, legat cu spirală. Ideal pentru manuale sau portofolii extinse care trebuie să stea deschise plate.',
  },
  prod7d: {
    ...SPIRAL_CATALOG_CATEGORY_CONFIG,
    recommendedSizeId: 's2',
    elementalPageCounts: {
      'elem7d-1': { kind: 'fixed', value: 1 },
      'elem7d-2': { kind: 'multiple', of: 2, min: 2, max: 200 },
      'elem7d-3': { kind: 'fixed', value: 1 },
    },
    explanation: 'Catalog format A5 cu copertă, interior de 24 pagini și copertă spate, legat cu spirală. Format de buzunar, ușor de transportat — potrivit pentru cataloage de prezentare la întâlniri.',
  },
  prod7e: {
    ...SPIRAL_CATALOG_CATEGORY_CONFIG,
    elementalPageCounts: {
      'elem7e-1': { kind: 'fixed', value: 1 },
      'elem7e-2': { kind: 'multiple', of: 2, min: 2, max: 200 },
      'elem7e-3': { kind: 'fixed', value: 1 },
    },
    explanation: 'Catalog cu copertă, interior de 96 pagini și copertă spate, legat cu spirală. Variantă pentru cataloage foarte extinse sau cărți de specialitate.',
  },
  prod8a: {
    ...CARDBOARD_LABEL_CATEGORY_CONFIG,
    recommendedSizeId: 's5',
    explanation: 'Etichetă din carton gros 90x50mm, cu gaură pentru agățare. Potrivită pentru etichete de bagaje sau atârnătoare de produs.',
  },
  prod8b: {
    ...CARDBOARD_LABEL_CATEGORY_CONFIG,
    recommendedSizeId: 's6',
    explanation: 'Etichetă din carton gros 80x50mm, cu capsă. Potrivită pentru etichete de prețuri prinse direct pe produs.',
  },
  prod8c: {
    ...CARDBOARD_LABEL_CATEGORY_CONFIG,
    recommendedSizeId: 's5',
    explanation: 'Etichetă din carton gros 90x50mm, cu gaură și capsă pentru fixare dublă. Potrivită pentru etichete care trebuie atașate sigur pe produse voluminoase.',
  },
  prod8d: {
    ...CARDBOARD_LABEL_CATEGORY_CONFIG,
    recommendedMediaId: 'p5',
    recommendedSizeId: 's6',
    explanation: 'Etichetă premium din carton lucios 250gsm, 80x50mm, tipărită pe ambele fețe, fără gaură sau capsă. Gata pentru aplicare cu adeziv sau șnur separat.',
  },
  prod8e: {
    ...CARDBOARD_LABEL_CATEGORY_CONFIG,
    recommendedSizeId: 's5',
    explanation: 'Etichetă din carton 90x50mm, tipărită alb-negru, cu o gaură pentru agățare. Variantă economică pentru etichetare în volum mare.',
  },
  prod9: { // Calendar
    allowedMediaIds: ['p2', 'p3', 'p4', 'p5'],
    allowedSizeIds: ['s1', 's2'],
    recommendedMediaId: 'p3',
    recommendedSizeId: 's1',
    allowedFoldTypes: ['none'],
    elementalPrintingFronts: {
      'elem9-1': ['color'],
      'elem9-2': ['color'],
      'elem9-3': ['none'],
    },
    elementalPrintingBacks: {
      'elem9-1': ['none'],
      'elem9-2': ['none'],
      'elem9-3': ['none'],
    },
    elementalPageCounts: {
      'elem9-1': { kind: 'fixed', value: 1 },
      'elem9-2': { kind: 'fixed', value: 24 },
      'elem9-3': { kind: 'fixed', value: 1 },
    },
    binding: { type: 'spiral', allowedColors: ['white', 'black'] },
    explanation: 'Calendar de perete cu copertă, 12 file lunare (tipărite doar pe față) și copertă spate, legat cu spirală. Format clasic pentru calendare promoționale anuale.',
  },
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod1a',
    categoryId: 'flyer',
    label: 'Fluturaș A4 Color, Față-Verso',
    amount: 1,
    elementals: [
      {
        id: 'elem1a-1',
        label: 'Coală Simplă',
        media: MOCK_PAPERS[1],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
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
    id: 'prod1b',
    categoryId: 'flyer',
    label: 'Fluturaș 1/3A4 Alb-Negru, O Față',
    amount: 1,
    elementals: [
      {
        id: 'elem1b-1',
        label: 'Coală Simplă',
        media: MOCK_PAPERS[0],
        size: { id: 's4', label: '1/3A4', width: 100, height: 210, unit: 'mm', widthMm: 100, heightMm: 210 },
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
    id: 'prod1c',
    categoryId: 'flyer',
    label: 'Fluturaș A5 Color, Față-Verso',
    amount: 1,
    elementals: [
      {
        id: 'elem1c-1',
        label: 'Coală Simplă',
        media: MOCK_PAPERS[1],
        size: { id: 's2', label: 'A5', width: 148, height: 210, unit: 'mm', widthMm: 148, heightMm: 210 },
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
    id: 'prod1d',
    categoryId: 'flyer',
    label: 'Fluturaș A4 Color, Doar Față',
    amount: 1,
    elementals: [
      {
        id: 'elem1d-1',
        label: 'Coală Simplă',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 2,
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
    id: 'prod1e',
    categoryId: 'flyer',
    label: 'Fluturaș Letter Color, Față-Verso',
    amount: 1,
    elementals: [
      {
        id: 'elem1e-1',
        label: 'Coală Simplă',
        media: MOCK_PAPERS[1],
        size: { id: 's3', label: 'Letter', width: 8.5, height: 11, unit: 'in', widthMm: 215.9, heightMm: 279.4 },
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
    id: 'prod2a',
    categoryId: 'brochure',
    label: 'Broșură A4, Interior 8 Pagini',
    amount: 1,
    elementals: [
      {
        id: 'elem2a-1',
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
        id: 'elem2a-2',
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
    id: 'prod2b',
    categoryId: 'brochure',
    label: 'Broșură A4, Interior 16 Pagini',
    amount: 1,
    elementals: [
      {
        id: 'elem2b-1',
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
        id: 'elem2b-2',
        label: 'Interior',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 16,
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
    id: 'prod2c',
    categoryId: 'brochure',
    label: 'Broșură A4, Interior 32 Pagini',
    amount: 1,
    elementals: [
      {
        id: 'elem2c-1',
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
        id: 'elem2c-2',
        label: 'Interior',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 32,
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
    id: 'prod2d',
    categoryId: 'brochure',
    label: 'Broșură A5, Interior 8 Pagini',
    amount: 1,
    elementals: [
      {
        id: 'elem2d-1',
        label: 'Copertă',
        media: MOCK_PAPERS[2],
        size: { id: 's2', label: 'A5', width: 148, height: 210, unit: 'mm', widthMm: 148, heightMm: 210 },
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
        id: 'elem2d-2',
        label: 'Interior',
        media: MOCK_PAPERS[2],
        size: { id: 's2', label: 'A5', width: 148, height: 210, unit: 'mm', widthMm: 148, heightMm: 210 },
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
    id: 'prod2e',
    categoryId: 'brochure',
    label: 'Broșură A4, Interior 24 Pagini',
    amount: 1,
    elementals: [
      {
        id: 'elem2e-1',
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
        id: 'elem2e-2',
        label: 'Interior',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 24,
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
    id: 'prod3a',
    categoryId: 'folder',
    label: 'Dosar cu Buzunar de Hârtie',
    amount: 1,
    elementals: [
      {
        id: 'elem3a-1',
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
        id: 'elem3a-2',
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
    id: 'prod3b',
    categoryId: 'folder',
    label: 'Dosar Simplu, fără Buzunar',
    amount: 1,
    elementals: [
      {
        id: 'elem3b-1',
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
    ],
  },
  {
    id: 'prod3c',
    categoryId: 'folder',
    label: 'Dosar cu Buzunar și Bandă Elastică',
    amount: 1,
    elementals: [
      {
        id: 'elem3c-1',
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
        id: 'elem3c-2',
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
    id: 'prod3d',
    categoryId: 'folder',
    label: 'Dosar A4 cu Buzunar Lucios',
    amount: 1,
    elementals: [
      {
        id: 'elem3d-1',
        label: 'Coală A3 Pliată',
        media: MOCK_PAPERS[3],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 2,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'gloss', sides: 'both' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 2 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem3d-2',
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
    id: 'prod3e',
    categoryId: 'folder',
    label: 'Dosar Simplu Mat fără Buzunar',
    amount: 1,
    elementals: [
      {
        id: 'elem3e-1',
        label: 'Coală A3 Pliată',
        media: MOCK_PAPERS[3],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 2,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'matt', sides: 'both' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 2 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod4a',
    categoryId: 'business-card',
    label: 'Card Standard 90x50, Față-Verso',
    amount: 1,
    elementals: [
      {
        id: 'elem4a-1',
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
    id: 'prod4b',
    categoryId: 'business-card',
    label: 'Card Compact 80x50, O Față',
    amount: 1,
    elementals: [
      {
        id: 'elem4b-1',
        label: 'Card de Vizită',
        media: MOCK_PAPERS[5],
        size: { id: 's6', label: 'Card Vizită Compact', width: 80, height: 50, unit: 'mm', widthMm: 80, heightMm: 50 },
        pageCount: 2,
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
    id: 'prod4c',
    categoryId: 'business-card',
    label: 'Card Premium 90x50, Lucios Față-Verso',
    amount: 1,
    elementals: [
      {
        id: 'elem4c-1',
        label: 'Card de Vizită',
        media: MOCK_PAPERS[4],
        size: { id: 's5', label: 'Card Vizită Standard', width: 90, height: 50, unit: 'mm', widthMm: 90, heightMm: 50 },
        pageCount: 2,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'gloss', sides: 'both' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod4d',
    categoryId: 'business-card',
    label: 'Card Standard 90x50, Soft-Touch, O Față',
    amount: 1,
    elementals: [
      {
        id: 'elem4d-1',
        label: 'Card de Vizită',
        media: MOCK_PAPERS[5],
        size: { id: 's5', label: 'Card Vizită Standard', width: 90, height: 50, unit: 'mm', widthMm: 90, heightMm: 50 },
        pageCount: 2,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'soft-touch', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod4e',
    categoryId: 'business-card',
    label: 'Card Compact 80x50, Față-Verso',
    amount: 1,
    elementals: [
      {
        id: 'elem4e-1',
        label: 'Card de Vizită',
        media: MOCK_PAPERS[5],
        size: { id: 's6', label: 'Card Vizită Compact', width: 80, height: 50, unit: 'mm', widthMm: 80, heightMm: 50 },
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
    id: 'prod5a',
    categoryId: 'folded-flyer',
    label: 'Pliant Tri-fold',
    amount: 1,
    elementals: [
      {
        id: 'elem5a-1',
        label: 'Coală',
        media: MOCK_PAPERS[1],
        size: { id: 's4', label: '1/3A4', width: 100, height: 210, unit: 'mm', widthMm: 100, heightMm: 210 },
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
    id: 'prod5b',
    categoryId: 'folded-flyer',
    label: 'Pliant Z-fold',
    amount: 1,
    elementals: [
      {
        id: 'elem5b-1',
        label: 'Coală',
        media: MOCK_PAPERS[1],
        size: { id: 's4', label: '1/3A4', width: 100, height: 210, unit: 'mm', widthMm: 100, heightMm: 210 },
        pageCount: 6,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'z-fold', folds: 2 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod5c',
    categoryId: 'folded-flyer',
    label: 'Pliant Bi-fold',
    amount: 1,
    elementals: [
      {
        id: 'elem5c-1',
        label: 'Coală',
        media: MOCK_PAPERS[1],
        size: { id: 's4', label: '1/3A4', width: 100, height: 210, unit: 'mm', widthMm: 100, heightMm: 210 },
        pageCount: 4,
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
    id: 'prod5d',
    categoryId: 'folded-flyer',
    label: 'Pliant Gate-fold A4',
    amount: 1,
    elementals: [
      {
        id: 'elem5d-1',
        label: 'Coală',
        media: MOCK_PAPERS[1],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 8,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'gate-fold', folds: 3 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod5e',
    categoryId: 'folded-flyer',
    label: 'Pliant Tri-fold A4',
    amount: 1,
    elementals: [
      {
        id: 'elem5e-1',
        label: 'Coală',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
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
    id: 'prod6a',
    categoryId: 'sticker-sheet',
    label: 'Coală A4 Lucioasă',
    amount: 1,
    elementals: [
      {
        id: 'elem6a-1',
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
    id: 'prod6b',
    categoryId: 'sticker-sheet',
    label: 'Coală A3 Mată',
    amount: 1,
    elementals: [
      {
        id: 'elem6b-1',
        label: 'Coală de Etichete',
        media: MOCK_STICKERS[1],
        size: { id: 's0', label: 'A3', width: 297, height: 420, unit: 'mm', widthMm: 297, heightMm: 420 },
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
    id: 'prod6c',
    categoryId: 'sticker-sheet',
    label: 'Coală A4 Transparentă',
    amount: 1,
    elementals: [
      {
        id: 'elem6c-1',
        label: 'Coală de Etichete',
        media: MOCK_STICKERS[2],
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
    id: 'prod6d',
    categoryId: 'sticker-sheet',
    label: 'Coală A5 Kraft',
    amount: 1,
    elementals: [
      {
        id: 'elem6d-1',
        label: 'Coală de Etichete',
        media: MOCK_STICKERS[3],
        size: { id: 's2', label: 'A5', width: 148, height: 210, unit: 'mm', widthMm: 148, heightMm: 210 },
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
    id: 'prod6e',
    categoryId: 'sticker-sheet',
    label: 'Coală A3 Lucioasă',
    amount: 1,
    elementals: [
      {
        id: 'elem6e-1',
        label: 'Coală de Etichete',
        media: MOCK_STICKERS[0],
        size: { id: 's0', label: 'A3', width: 297, height: 420, unit: 'mm', widthMm: 297, heightMm: 420 },
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
    id: 'prod7a',
    categoryId: 'spiral-catalog',
    label: 'Catalog cu spira, Interior 16 Pagini',
    amount: 1,
    binding: { type: 'spiral', color: 'white' },
    elementals: [
      {
        id: 'elem7a-1',
        label: 'Copertă',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 1,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'gloss', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem7a-2',
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
      {
        id: 'elem7a-3',
        label: 'Copertă Spate',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 1,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'gloss', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod7b',
    categoryId: 'spiral-catalog',
    label: 'Catalog cu spira, Interior 32 Pagini',
    amount: 1,
    binding: { type: 'spiral', color: 'white' },
    elementals: [
      {
        id: 'elem7b-1',
        label: 'Copertă',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 1,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'gloss', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem7b-2',
        label: 'Interior',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 32,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem7b-3',
        label: 'Copertă Spate',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 1,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'gloss', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod7c',
    categoryId: 'spiral-catalog',
    label: 'Catalog cu spira, Interior 48 Pagini',
    amount: 1,
    binding: { type: 'spiral', color: 'white' },
    elementals: [
      {
        id: 'elem7c-1',
        label: 'Copertă',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 1,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'gloss', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem7c-2',
        label: 'Interior',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 48,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem7c-3',
        label: 'Copertă Spate',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 1,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'gloss', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod7d',
    categoryId: 'spiral-catalog',
    label: 'Catalog cu spira, Format A5, Interior 24 Pagini',
    amount: 1,
    binding: { type: 'spiral', color: 'white' },
    elementals: [
      {
        id: 'elem7d-1',
        label: 'Copertă',
        media: MOCK_PAPERS[2],
        size: { id: 's2', label: 'A5', width: 148, height: 210, unit: 'mm', widthMm: 148, heightMm: 210 },
        pageCount: 1,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'gloss', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem7d-2',
        label: 'Interior',
        media: MOCK_PAPERS[2],
        size: { id: 's2', label: 'A5', width: 148, height: 210, unit: 'mm', widthMm: 148, heightMm: 210 },
        pageCount: 24,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem7d-3',
        label: 'Copertă Spate',
        media: MOCK_PAPERS[2],
        size: { id: 's2', label: 'A5', width: 148, height: 210, unit: 'mm', widthMm: 148, heightMm: 210 },
        pageCount: 1,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'gloss', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod7e',
    categoryId: 'spiral-catalog',
    label: 'Catalog cu spira, Interior 96 Pagini',
    amount: 1,
    binding: { type: 'spiral', color: 'white' },
    elementals: [
      {
        id: 'elem7e-1',
        label: 'Copertă',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 1,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'gloss', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem7e-2',
        label: 'Interior',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 96,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem7e-3',
        label: 'Copertă Spate',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 1,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'gloss', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
    ],
  },
  {
    id: 'prod8a',
    categoryId: 'cardboard-label',
    label: 'Etichetă Carton 90x50, cu Gaură',
    amount: 1,
    elementals: [
      {
        id: 'elem8a-1',
        label: 'Etichetă Carton',
        media: MOCK_PAPERS[5],
        size: { id: 's5', label: 'Card Vizită Standard', width: 90, height: 50, unit: 'mm', widthMm: 90, heightMm: 50 },
        pageCount: 2,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
          staple: { hole: true, staple: false },
        },
      },
    ],
  },
  {
    id: 'prod8b',
    categoryId: 'cardboard-label',
    label: 'Etichetă Carton 80x50, cu Capsă',
    amount: 1,
    elementals: [
      {
        id: 'elem8b-1',
        label: 'Etichetă Carton',
        media: MOCK_PAPERS[5],
        size: { id: 's6', label: 'Card Vizită Compact', width: 80, height: 50, unit: 'mm', widthMm: 80, heightMm: 50 },
        pageCount: 2,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
          staple: { hole: false, staple: true },
        },
      },
    ],
  },
  {
    id: 'prod8c',
    categoryId: 'cardboard-label',
    label: 'Etichetă Carton 90x50, cu Gaură și Capsă',
    amount: 1,
    elementals: [
      {
        id: 'elem8c-1',
        label: 'Etichetă Carton',
        media: MOCK_PAPERS[5],
        size: { id: 's5', label: 'Card Vizită Standard', width: 90, height: 50, unit: 'mm', widthMm: 90, heightMm: 50 },
        pageCount: 2,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
          staple: { hole: true, staple: true },
        },
      },
    ],
  },
  {
    id: 'prod8d',
    categoryId: 'cardboard-label',
    label: 'Etichetă Premium 80x50, Față-Verso',
    amount: 1,
    elementals: [
      {
        id: 'elem8d-1',
        label: 'Etichetă Carton',
        media: MOCK_PAPERS[4],
        size: { id: 's6', label: 'Card Vizită Compact', width: 80, height: 50, unit: 'mm', widthMm: 80, heightMm: 50 },
        pageCount: 2,
        printing: { front: 'color', back: 'color' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
          staple: { hole: false, staple: false },
        },
      },
    ],
  },
  {
    id: 'prod8e',
    categoryId: 'cardboard-label',
    label: 'Etichetă Carton 90x50 Alb-Negru, cu Gaură',
    amount: 1,
    elementals: [
      {
        id: 'elem8e-1',
        label: 'Etichetă Carton',
        media: MOCK_PAPERS[5],
        size: { id: 's5', label: 'Card Vizită Standard', width: 90, height: 50, unit: 'mm', widthMm: 90, heightMm: 50 },
        pageCount: 2,
        printing: { front: 'black', back: 'none' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
          staple: { hole: true, staple: false },
        },
      },
    ],
  },
  {
    id: 'prod9',
    categoryId: 'calendar',
    label: 'Calendar',
    amount: 1,
    binding: { type: 'spiral', color: 'white' },
    elementals: [
      {
        id: 'elem9-1',
        label: 'Copertă',
        media: MOCK_PAPERS[2],
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
      {
        id: 'elem9-2',
        label: 'Interior',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 24,
        printing: { front: 'color', back: 'none' },
        finishing: {
          lamination: { type: 'none', sides: 'front' },
          folding: { type: 'none', folds: 0 },
          creasing: { count: 0 },
          roundedCornes: { corners: [] },
        },
      },
      {
        id: 'elem9-3',
        label: 'Copertă Spate',
        media: MOCK_PAPERS[2],
        size: { id: 's1', label: 'A4', width: 210, height: 297, unit: 'mm', widthMm: 210, heightMm: 297 },
        pageCount: 1,
        printing: { front: 'none', back: 'none' },
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
