import type { Product, Elemental } from '../types';
import type { PageCountConstraint } from '../data/mockData';
import { LAMINATION_RO, LAMINATION_SIDES_RO, FOLD_RO } from './labels';

// A product is "personalized" once its elementals/binding diverge from the
// pristine catalog definition (quantity is a separate concern, not a setting).
const settingsOf = (p: Product) =>
  JSON.stringify({ elementals: p.elementals, binding: p.binding ?? null, pocketEnabled: p.pocketEnabled ?? true });

export function isPersonalized(product: Product, baseline: Product | undefined) {
  return !!baseline && settingsOf(baseline) !== settingsOf(product);
}

/**
 * Human-readable chips for the advanced settings that diverge from the catalog
 * default. The advanced section can be collapsed, so these keep a changed
 * setting on screen even when its control is hidden — collapsing must never
 * conceal something the user chose.
 */
export function advancedSummary(
  element: Elemental,
  baseline: Elemental | undefined,
  pageCount?: PageCountConstraint,
): string[] {
  if (!baseline) return [];
  const chips: string[] = [];
  const { finishing } = element;
  const base = baseline.finishing;

  const { lamination } = finishing;
  if (lamination.type !== base.lamination.type || lamination.sides !== base.lamination.sides) {
    const type = LAMINATION_RO[lamination.type] ?? lamination.type;
    chips.push(
      lamination.type === 'none'
        ? 'Laminare: Fără'
        : `Laminare: ${type} · ${LAMINATION_SIDES_RO[lamination.sides] ?? lamination.sides}`
    );
  }

  if (finishing.folding.type !== base.folding.type) {
    chips.push(`Pliere: ${FOLD_RO[finishing.folding.type] ?? finishing.folding.type}`);
  }

  if (finishing.creasing.count !== base.creasing.count) {
    chips.push(`Biguitură: ${finishing.creasing.count}`);
  }

  const corners = finishing.roundedCornes.corners;
  const baseCorners = base.roundedCornes.corners;
  if (corners.length !== baseCorners.length || corners.some((c) => !baseCorners.includes(c))) {
    chips.push(corners.length ? `Colțuri rotunjite: ${corners.length}` : 'Colțuri rotunjite: fără');
  }

  const staple = finishing.staple;
  const baseStaple = base.staple;
  if (staple && (staple.hole !== baseStaple?.hole || staple.staple !== baseStaple?.staple)) {
    const parts = [staple.hole && 'Gaură', staple.staple && 'Capsă'].filter(Boolean);
    chips.push(`Capsare: ${parts.length ? parts.join(', ') : 'fără'}`);
  }

  // A `multiple` page count has its own stepper in the essentials, so chipping it
  // would only repeat what is already on screen. A `derived` one has no control at
  // all — it moves silently when the fold changes — so that is the case worth a chip.
  if (element.pageCount !== baseline.pageCount && pageCount?.kind !== 'multiple') {
    chips.push(`Pagini: ${element.pageCount}`);
  }

  // A custom size is an advanced choice too — a preset lives in the essentials.
  if (element.size.widthMm !== baseline.size.widthMm || element.size.heightMm !== baseline.size.heightMm) {
    chips.push(
      `Dimensiune: ${element.size.width.toFixed(1)} × ${element.size.height.toFixed(1)} ${element.size.unit}`
    );
  }

  return chips;
}
