import type { PrintInk, BindingType, SpiralColor, Staple, LaminationSides, RoundedCorner, Pocket } from '.';

export type PageCountConstraint =
  | { kind: 'derived' }
  | { kind: 'fixed';    value: number }
  | { kind: 'multiple'; of: number; min: number; max: number };

export type ProductConfig = {
  allowedMediaIds: string[];
  allowedSizeIds: string[];
  // The printing machine (Catalog.machines) whose maxWidthMm/maxHeightMm this
  // product is bound by. Omit for a host catalog that predates the concept —
  // warnIfCatalogPredatesMachine flags the drift in dev rather than silently
  // enforcing no ceiling at all.
  machineId?: string;
  recommendedMediaId: string;
  recommendedSizeId: string;
  // Whether all elementals must share one size. Defaults to true for products
  // with more than one elemental; set false to allow per-elemental sizes.
  sharedSize?: boolean;
  allowedFoldTypes: string[];
  allowedPrintingFronts?: Array<PrintInk | 'none'>;
  allowedPrintingBacks?: Array<PrintInk | 'none'>;
  elementalPrintingFronts?: Record<string, Array<PrintInk | 'none'>>;
  elementalPrintingBacks?: Record<string, Array<PrintInk | 'none'>>;
  elementalPageCounts?: Record<string, PageCountConstraint>;
  // Fallback page-count rule for elements with no entry in elementalPageCounts —
  // notably the ones a user adds at runtime, whose ids no catalog can predict.
  // Mirrors allowedPrintingFronts vs elementalPrintingFronts.
  allowedPageCount?: PageCountConstraint;
  // Whether the user may add and remove elements. Opt-in: omit and the product
  // keeps exactly the parts the catalog gave it.
  allowElementEditing?: boolean;
  // Which creasing counts this product offers, narrowing what the stock can hold.
  // Omit to offer the full 0-5 range on paper heavy enough to take a crease; use []
  // to rule creasing out; use a single value to fix it structurally.
  allowedCreasingCounts?: number[];
  // Per-element creasing is set on the elemental itself, as finishing.creasing.min/max
  // — authored where the part is defined rather than in an id-keyed record here.
  binding?: { type: BindingType; allowedColors?: SpiralColor[] };
  // The glued-in paper pocket of a presentation folder. Like binding, it is a stock
  // item the catalog includes or omits — not an Elemental the customer can spec.
  pocket?: Pocket;
  // Whether the finished piece is one half of a sheet folded down the middle: an
  // A4 Mapă is cut from A3. Only the drawing cares — the size, the payload and the
  // price stay the finished A4 — but the creases and the pocket live on the flat
  // sheet, so that is the shape worth drawing.
  foldedInHalf?: boolean;
  // Whether this product is punched with a hanging hole. Like the pocket it is a
  // stock operation the catalog includes or omits, not something the customer
  // specs — the instance only decides whether to keep it (`Product.punchHole`).
  punchHole?: boolean;
  allowedStaple?: Staple;
  // Which lamination sides this product offers. Omit to allow all three
  // (front/back/both) — a blank verso can still be laminated, so this is a
  // product decision, not something derived from what's printed.
  allowedLaminationSides?: LaminationSides[];
  // Which corners this product lets the customer round (1 = top-left … 4 =
  // bottom-right), narrowing what the stock can take. Omit to offer all four on
  // paper heavy enough to cut clean; use [] to rule rounding out on a shape that
  // never gets it, whatever the weight.
  allowedRoundedCorners?: RoundedCorner[];
  explanation?: string;
};
