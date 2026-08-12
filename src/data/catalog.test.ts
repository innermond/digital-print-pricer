import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Catalog } from './catalog';
import { MOCK_CATALOG } from './catalog';

// The warning latches on a module-level flag so it fires once per page load, so
// every case needs a fresh module instance.
async function freshWarn() {
  vi.resetModules();
  const mod = await import('./catalog');
  return mod.warnIfCatalogPredatesRoundedCorners;
}

const withConfigs = (config: Catalog['config']): Catalog => ({ ...MOCK_CATALOG, config });

// A host catalog that predates the field: same shape, field absent everywhere.
const preMigrationCatalog = (): Catalog =>
  withConfigs(
    Object.fromEntries(
      Object.entries(MOCK_CATALOG.config).map(([id, c]) => {
        const copy = { ...c };
        delete copy.allowedRoundedCorners;
        return [id, copy];
      })
    )
  );

describe('catalog integrity', () => {
  // prod10 (Calendar A4) shipped without a config entry, so its configuration
  // stage rendered the element tabs over an empty panel with no explanation.
  it('gives every product a config entry', () => {
    const missing = MOCK_CATALOG.products
      .filter((p) => !MOCK_CATALOG.config[p.id])
      .map((p) => `${p.id} (${p.label})`);
    expect(missing).toEqual([]);
  });

  it('has no config entry for a product that does not exist', () => {
    const ids = new Set(MOCK_CATALOG.products.map((p) => p.id));
    expect(Object.keys(MOCK_CATALOG.config).filter((id) => !ids.has(id))).toEqual([]);
  });

  // Per-elemental records are keyed by elemental id, which is exactly where a
  // copy-pasted product config drifts from the product it describes.
  it('keys every per-elemental rule on an elemental the product actually has', () => {
    const stray: string[] = [];
    for (const product of MOCK_CATALOG.products) {
      const config = MOCK_CATALOG.config[product.id];
      if (!config) continue;
      const ids = new Set(product.elementals.map((e) => e.id));
      for (const field of ['elementalPrintingFronts', 'elementalPrintingBacks', 'elementalPageCounts'] as const) {
        for (const key of Object.keys(config[field] ?? {})) {
          if (!ids.has(key)) stray.push(`${product.id}.${field}['${key}']`);
        }
      }
    }
    expect(stray).toEqual([]);
  });

  it('recommends media and sizes that the product actually allows', () => {
    const bad: string[] = [];
    for (const [id, config] of Object.entries(MOCK_CATALOG.config)) {
      if (config.recommendedMediaId && !config.allowedMediaIds.includes(config.recommendedMediaId)) {
        bad.push(`${id}: recommendedMediaId ${config.recommendedMediaId} not in allowedMediaIds`);
      }
      if (config.recommendedSizeId && !config.allowedSizeIds.includes(config.recommendedSizeId)) {
        bad.push(`${id}: recommendedSizeId ${config.recommendedSizeId} not in allowedSizeIds`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('warnIfCatalogPredatesRoundedCorners', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns when no config in the catalog declares the field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn();

    check(preMigrationCatalog());

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('allowedRoundedCorners');
    expect(warn.mock.calls[0][0]).toContain('npm run dump:catalog');
  });

  it('warns only once, however many times it is called', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn();

    check(preMigrationCatalog());
    check(preMigrationCatalog());
    check(preMigrationCatalog());

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('stays quiet for the real catalog, which declares the field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn();

    check(MOCK_CATALOG);

    expect(warn).not.toHaveBeenCalled();
  });

  it('stays quiet when even one config declares the field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn();

    // Post-migration by construction: the ~37 products that legitimately allow
    // corners omit the field, and that must not be mistaken for drift.
    check(withConfigs({
      a: { ...MOCK_CATALOG.config['prod4a'] },
      b: { ...MOCK_CATALOG.config['prod0a'] }, // the only one carrying []
    }));

    expect(warn).not.toHaveBeenCalled();
  });

  it('stays quiet for an empty catalog rather than crying drift', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn();

    check(withConfigs({}));

    expect(warn).not.toHaveBeenCalled();
  });
});
