import { v4 as uuidv4 } from 'uuid';
import type { Elemental, Media, Size } from '../types';
import type { Catalog } from '../data/catalog';
import type { ProductConfig } from '../data/mockData';

/**
 * A fresh, neutral part for a product whose config sets `allowElementEditing`.
 *
 * Everything is seeded from what the config recommends, so the new part starts
 * out valid rather than merely well-typed — a media id the catalog doesn't have
 * would otherwise reach MediaSelector as a card that can never be selected.
 */
export function blankElemental(
  config: ProductConfig,
  catalog: Catalog,
  existing: Elemental[],
): Elemental {
  return {
    // Globally unique, not merely unique within this product: updateElemental
    // matches by elemental id across every product, so a collision cross-writes.
    id: `elem-${uuidv4()}`,
    label: nextLabel(existing),
    media: pickMedia(config, catalog),
    size: pickSize(config, catalog),
    pageCount: 2,
    printing: { front: 'color', back: 'color' },
    finishing: {
      lamination: { type: 'none', sides: 'front' },
      folding: { type: 'none', folds: 0 },
      creasing: { count: 0 },
      roundedCornes: { corners: [] },
    },
  };
}

/** The first free "Element N", so removing then adding never repeats a name. */
const nextLabel = (existing: Elemental[]) => {
  const taken = new Set(existing.map((e) => e.label));
  let n = 1;
  while (taken.has(`Element ${n}`)) n++;
  return `Element ${n}`;
};

const pickMedia = (config: ProductConfig, catalog: Catalog): Media => {
  const allowed = catalog.media.filter((m) => config.allowedMediaIds.includes(m.id));
  return allowed.find((m) => m.id === config.recommendedMediaId) ?? allowed[0] ?? catalog.media[0];
};

const pickSize = (config: ProductConfig, catalog: Catalog): Size => {
  const allowed = catalog.sizes.filter((s) => config.allowedSizeIds.includes(s.id));
  return allowed.find((s) => s.id === config.recommendedSizeId) ?? allowed[0] ?? catalog.sizes[0];
};
