import type { Size, SizeUnit } from '../types';

const UNIT_TO_MM = {
  mm: 1,
  in: 25.4,
  pt: 0.352778,
};

const MM_TO_UNIT = {
  mm: 1,
  in: 1 / 25.4,
  pt: 1 / 0.352778,
};

export const convertSize = (value: number, fromUnit: SizeUnit, toUnit: SizeUnit) => {
  const inMM = value * UNIT_TO_MM[fromUnit];
  const result = inMM * MM_TO_UNIT[toUnit];
  return Math.round(result * 100) / 100;
};

export type Orientation = 'portrait' | 'landscape' | 'square';

/** Which way round a pair of dimensions reads. */
export const orientationOf = (widthMm: number, heightMm: number): Orientation =>
  widthMm > heightMm ? 'landscape' : widthMm < heightMm ? 'portrait' : 'square';

const ORIENTATION_RO: Record<Orientation, string> = {
  landscape: 'orizontal',
  portrait: 'vertical',
  square: '',
};

// `convertSize` rounds to 2 decimals, so an mm → in → mm round trip drifts
// (210 → 8.27 in → 210.06 mm). Exact equality made that drift read as a custom
// size. 0.2 mm swallows the worst in/pt round trip, and the two closest presets
// — A4's 210 and Letter's 215.9 — are 5.9 mm apart, so nothing collides.
const MATCH_TOLERANCE_MM = 0.2;

const sameMm = (a: number, b: number) => Math.abs(a - b) <= MATCH_TOLERANCE_MM;

export type PresetMatch = {
  preset: Size;
  orientation: Orientation;
  // True when the sheet reads the opposite way round to the preset as
  // catalogued — 297×210 is still an A4, just landscape.
  rotated: boolean;
};

/**
 * The catalog preset a pair of dimensions is, in either orientation.
 *
 * The catalogued orientation is tried first so a square preset (50x50) never
 * reports itself rotated, and so the presets that are already wide (Carte
 * Vizită Standard 90×50, 120x100) keep their plain name.
 */
export function matchSizePreset(presets: Size[], widthMm: number, heightMm: number): PresetMatch | null {
  const orientation = orientationOf(widthMm, heightMm);

  const asCatalogued = presets.find((p) => sameMm(p.widthMm, widthMm) && sameMm(p.heightMm, heightMm));
  if (asCatalogued) return { preset: asCatalogued, orientation, rotated: false };

  const rotated = presets.find((p) => sameMm(p.widthMm, heightMm) && sameMm(p.heightMm, widthMm));
  if (rotated) return { preset: rotated, orientation, rotated: true };

  return null;
}

/**
 * `A4` in the catalogued orientation, `A4 orizontal` turned the other way.
 * The suffix comes from the actual dimensions, not from the fact of rotation,
 * so a flipped business card reads `Carte Vizită Standard vertical`.
 */
export const sizePresetLabel = (match: PresetMatch): string =>
  match.rotated ? `${match.preset.label} ${ORIENTATION_RO[match.orientation]}`.trim() : match.preset.label;

/**
 * A Size carrying the preset id and name its dimensions actually are, falling
 * back to the custom one when they are no standard format. Keeping this at the
 * point the size is written is what stops an edit from throwing the format
 * name away.
 */
export function resolveSize(presets: Size[], widthMm: number, heightMm: number, unit: SizeUnit): Size {
  const match = matchSizePreset(presets, widthMm, heightMm);
  return {
    id: match ? match.preset.id : 'custom',
    label: match ? sizePresetLabel(match) : 'Personalizat',
    width: convertSize(widthMm, 'mm', unit),
    height: convertSize(heightMm, 'mm', unit),
    widthMm,
    heightMm,
    unit,
  };
}

/** The same sheet turned 90°, renamed to suit. */
export const rotateSize = (presets: Size[], size: Size): Size =>
  resolveSize(presets, size.heightMm, size.widthMm, size.unit);
