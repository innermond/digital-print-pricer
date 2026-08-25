import type { Product, Size } from '../types';

// Romanian display labels for the values that travel as English identifiers.
// These maps were duplicated across AssemblySummary, PreviewCard and
// MediaSelector; keep them here so a wording change lands once.

export const LAMINATION_RO: Record<string, string> = {
  none: 'Fără', gloss: 'Lucios', matt: 'Mat', 'soft-touch': 'Soft-touch',
};

export const LAMINATION_SIDES_RO: Record<string, string> = {
  front: 'față', back: 'verso', both: 'ambele fețe',
};

export const FOLD_RO: Record<string, string> = {
  none: 'Fără', 'half-fold': 'La jumătate', 'tri-fold': 'În trei', 'z-fold': 'Z', 'gate-fold': 'Poartă',
};

export const SPIRAL_COLOR_RO: Record<string, string> = {
  white: 'Alb', black: 'Negru',
};

export const CORNER_RO: Record<number, string> = {
  1: 'Stânga sus', 2: 'Dreapta sus', 3: 'Stânga jos', 4: 'Dreapta jos',
};

/** Romanian noun agreement for a count, e.g. 1 element / 3 elemente. */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * A one-line spec of what the customer actually configured, e.g.
 * `A4 · Copertă 4 p. · Interior 24 p. · Laminare Mat`.
 *
 * `product.label` is the catalog entry's name ("Broșură A5, Interior 16 Pagini")
 * and goes stale the moment a size or page count is changed — this is what the
 * offer stage shows instead once the product diverges from the catalog.
 */
export function describeProduct(product: Product): string {
  const { elementals } = product;
  if (elementals.length === 0) return product.label;

  const parts: string[] = [];

  // Multi-element products share one size (ConfigureStage writes through
  // setProductSize), so say it once — unless a catalog product opts out of
  // sharing and the elementals really do differ.
  const sizeShared = elementals.every((e) => e.size.id === elementals[0].size.id);
  if (sizeShared) parts.push(sizeText(elementals[0].size));

  for (const element of elementals) {
    const size = sizeShared ? '' : ` ${sizeText(element.size)}`;
    parts.push(`${element.label}${size} ${element.pageCount} p.`);
  }

  // Only worth a segment when something is actually laminated; a plain job
  // stays short rather than trailing "Laminare: Fără".
  const laminated = elementals.find((e) => e.finishing.lamination.type !== 'none');
  if (laminated) {
    const { type } = laminated.finishing.lamination;
    parts.push(`Laminare ${LAMINATION_RO[type] ?? type}`);
  }

  return parts.join(' · ');
}

/** A preset shows its name; a custom size has none worth showing, so give dimensions. */
const sizeText = (size: Size) =>
  size.id === 'custom'
    ? `${size.width.toFixed(1)} × ${size.height.toFixed(1)} ${size.unit}`
    : size.label;
