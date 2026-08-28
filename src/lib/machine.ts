import type { Machine } from '../types';
import type { ProductConfig } from '../data/mockData';

// The printing machine a product's config points at, or undefined when the
// catalog doesn't declare one (see warnIfCatalogPredatesMachine).
export const resolveMachine = (config: ProductConfig | undefined, machines: Machine[]): Machine | undefined =>
  machines.find((m) => m.id === config?.machineId);

const sortedMm = (a: number, b: number): [number, number] => (a <= b ? [a, b] : [b, a]);

/**
 * Whether the press can take this sheet, in whichever orientation it is fed.
 * No machine means no ceiling — everything fits.
 *
 * Short edge against short edge, long against long: a 420×297 sheet is the same
 * piece of paper as a 297×420 one. Comparing width to width used to reject an
 * A3 the moment it was turned sideways.
 */
export const fitsMachine = (widthMm: number, heightMm: number, machine: Machine | undefined): boolean => {
  if (!machine) return true;
  const [shortSheet, longSheet] = sortedMm(widthMm, heightMm);
  const [shortPress, longPress] = sortedMm(machine.maxWidthMm, machine.maxHeightMm);
  return shortSheet <= shortPress && longSheet <= longPress;
};

/**
 * The largest one side may be while the other is held at `otherMm`, for the
 * sheet to still fit the press some way round. Undefined means no ceiling.
 *
 * With the other side short enough to be the sheet's short edge, this one may
 * run to the press's long edge; once the other side is the long edge itself,
 * this one is capped by the press's short edge. An `otherMm` already past the
 * long edge lands in that second branch — the sheet cannot fit at all, but the
 * field stays usable, so pulling the other side back down recovers.
 */
export const maxSideMm = (otherMm: number, machine: Machine | undefined): number | undefined => {
  if (!machine) return undefined;
  const [shortPress, longPress] = sortedMm(machine.maxWidthMm, machine.maxHeightMm);
  return otherMm <= shortPress ? longPress : shortPress;
};

/**
 * The largest one side may be, with the other held at `otherMm`, for the sheet
 * the piece is *folded from* to still fit the press.
 *
 * Which edge grows on unfolding depends on which is shorter, and that depends on
 * the value being typed — so there are two regimes and the roomier one wins:
 *   - this side is the shorter one, so it is the one that grows: `this × factor`
 *     has to fit beside `otherMm`, and `this` cannot exceed `otherMm`;
 *   - this side is the longer one, so the other grows instead: `this` has to fit
 *     beside `otherMm × factor`, and only counts while it stays above `otherMm`.
 *
 * Like maxSideMm, this never returns 0 — a cap of zero would pin the field shut
 * rather than let the customer pull the other side back down.
 */
export const maxSideUnfoldedMm = (
  otherMm: number,
  factor: number,
  machine: Machine | undefined
): number | undefined => {
  if (!machine) return undefined;
  if (factor <= 1) return maxSideMm(otherMm, machine);

  const [, longPress] = sortedMm(machine.maxWidthMm, machine.maxHeightMm);
  const asShortSide = Math.min(otherMm, maxSideMm(otherMm, machine)! / factor);

  // An `otherMm` that cannot fit even alone leaves this regime empty; maxSideMm
  // would otherwise answer for a sheet that does not exist.
  const otherGrown = otherMm * factor;
  const asLongSide = otherGrown <= longPress ? maxSideMm(otherGrown, machine)! : 0;

  return Math.max(asShortSide, asLongSide > otherMm ? asLongSide : 0);
};
