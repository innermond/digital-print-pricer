import type { Product, ProductCategory, Media, Size, Machine, ProductConfig } from '../types';
import catalogData from './catalog.json';

// Everything the configurator needs to render, in one serializable object.
// Standalone dev uses MOCK_CATALOG (src/data/catalog.json); a host app
// (printuridigital) injects an equivalent object fetched from its endpoint.
export type Catalog = {
  products: Product[];
  config: Record<string, ProductConfig>;
  categories: ProductCategory[];
  media: Media[];
  sizes: Size[];
  machines: Machine[];
};

// The host's catalog, as its admin downloads it (Calculator preț → "Descarcă
// catalogul") or `php artisan pricer:export` writes it. The database there is the
// source of truth; this file is a copy that is refreshed from it. The cast is
// because a JSON module's literal types are wider than the unions in ../types.
export const MOCK_CATALOG = catalogData as unknown as Catalog;

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
    'the host\'s `pricer:export`. (Harmless if every product in your catalog really does ' +
    'allow rounded corners.)'
  );
};

let warnedAboutMachine = false;

/**
 * Dev-only drift check on a host-injected catalog.
 *
 * `machineId` is what ties a product to the printing machine's max
 * width/height (`catalog.machines`), and it restricts. A catalog that
 * predates it doesn't fail — it quietly stops enforcing any print-size
 * ceiling at all, letting a custom size of any dimensions through. Re-seeding
 * the host catalog is the actual fix; this is only a smoke detector for local
 * and staging.
 */
export const warnIfCatalogPredatesMachine = (catalog: Catalog): void => {
  if (!import.meta.env.DEV || warnedAboutMachine) return;
  const configs = Object.values(catalog.config);
  if (configs.length === 0) return;
  if (configs.some((c) => c.machineId !== undefined)) return;
  warnedAboutMachine = true;
  console.warn(
    '[pricer] No product config declares `machineId`. If this catalog came from a host ' +
    'endpoint it likely predates that field, so no printing-machine max width/height is ' +
    'being enforced on any product. Re-seed it with the host\'s `pricer:export`.'
  );
};
