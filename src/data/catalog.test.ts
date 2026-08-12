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
