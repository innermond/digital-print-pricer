import type { Product, ProductCategory, Media, Size } from '../types';
import type { ProductConfig } from './mockData';
import { MOCK_PRODUCTS, PRODUCT_CONFIG, PRODUCT_CATEGORIES, MOCK_MEDIA, MOCK_SIZES } from './mockData';

// Everything the configurator needs to render, in one serializable object.
// Standalone dev uses MOCK_CATALOG (assembled from mockData); a host app
// (materialpublicitar) injects an equivalent object fetched from its endpoint.
export type Catalog = {
  products: Product[];
  config: Record<string, ProductConfig>;
  categories: ProductCategory[];
  media: Media[];
  sizes: Size[];
};

export const MOCK_CATALOG: Catalog = {
  products: MOCK_PRODUCTS,
  config: PRODUCT_CONFIG,
  categories: PRODUCT_CATEGORIES,
  media: MOCK_MEDIA,
  sizes: MOCK_SIZES,
};

let warnedAboutRoundedCorners = false;

/**
 * Dev-only drift check on a host-injected catalog.
 *
 * `allowedRoundedCorners` restricts, so a catalog that predates it doesn't fail
 * — it quietly starts offering rounded corners on Afiș and on Mapă de
 * Prezentare covers (the latter immediately, since folder stock is above the
 * 170 GSM threshold). Re-seeding the host catalog is the actual fix; this is
 * only a smoke detector for local and staging.
 *
 * One warning for the whole catalog rather than one per product: ~37 products
 * legitimately allow corners and omit the field, so per-product would be noise.
 * A catalog that declares it anywhere is post-migration by construction.
 */
export const warnIfCatalogPredatesRoundedCorners = (catalog: Catalog): void => {
  if (!import.meta.env.DEV || warnedAboutRoundedCorners) return;
  const configs = Object.values(catalog.config);
  if (configs.length === 0) return;
  if (configs.some((c) => c.allowedRoundedCorners !== undefined)) return;
  warnedAboutRoundedCorners = true;
  console.warn(
    '[pricer] No product config declares `allowedRoundedCorners`. If this catalog came ' +
    'from a host endpoint it likely predates that field, so Afiș and Mapă de Prezentare ' +
    'will now offer rounded corners they cannot be produced with. Re-seed it with ' +
    '`npm run dump:catalog`. (Harmless if every product in your catalog really does ' +
    'allow rounded corners.)'
  );
};
