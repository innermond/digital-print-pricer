import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ProductConfig } from './mockData';
import type { Catalog } from './catalog';
import { MOCK_CATALOG } from './catalog';
import {
  allowedLaminationTypes,
  allowedCreasingCounts,
  allowedRoundedCorners,
} from '../lib/finishingRules';

// The warning latches on a module-level flag so it fires once per page load, so
// every case needs a fresh module instance.
async function freshWarn(name: 'warnIfCatalogPredatesRoundedCorners' | 'warnIfCatalogPredatesMachine') {
  vi.resetModules();
  const mod = await import('./catalog');
  return mod[name];
}

const withConfigs = (config: Catalog['config']): Catalog => ({ ...MOCK_CATALOG, config });

// A host catalog that predates the field: same shape, field absent everywhere.
const preMigrationCatalog = (field: keyof ProductConfig): Catalog =>
  withConfigs(
    Object.fromEntries(
      Object.entries(MOCK_CATALOG.config).map(([id, c]) => {
        const copy = { ...c };
        delete copy[field];
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

  // Pre-existing drift, deliberately recorded rather than fixed: the brochure
  // covers open with one crease while BROCHURE_CATEGORY_CONFIG rules creasing out
  // (`allowedCreasingCounts: []`). The crease is real — a half-folded A4 cover is
  // creased once, and the 300 GSM stock takes it — so the data is right and the
  // config is the side that is wrong. Fixing it means widening the config, which
  // changes what the Biguitură control offers on every brochure, so it is left as
  // an owner's decision. Remove an entry here the moment it is resolved; nothing
  // new should ever be added.
  const KNOWN_FINISHING_DRIFT = new Set([
    'prod2c/elem2c-1: creasing 1',
    'prod2d/elem2d-1: creasing 1',
    'prod2e/elem2e-1: creasing 1',
    'prod2f/elem2f-1: creasing 1',
    'prod2g/elem2g-1: creasing 1',
    'prod2h/elem2h-1: creasing 1',
  ]);

  // A preset that opens with a finishing its own config forbids shows the
  // customer a selection the control cannot represent, and the next unrelated
  // edit silently clamps it away.
  it('opens every product on finishing selections its config allows', () => {
    const bad: string[] = [];
    for (const product of MOCK_CATALOG.products) {
      const config = MOCK_CATALOG.config[product.id];
      if (!config) continue;
      for (const elem of product.elementals) {
        const { lamination, creasing, roundedCornes } = elem.finishing;
        // 'none' is always on the table, whatever the stock.
        if (lamination.type !== 'none' && !allowedLaminationTypes(elem).includes(lamination.type)) {
          bad.push(`${product.id}/${elem.id}: lamination ${lamination.type}`);
        }
        // 0 is "no crease" — always valid, the same way lamination 'none' is, and
        // it is not in the list when the product or the stock rules creasing out.
        if (creasing.count !== 0 && !allowedCreasingCounts(elem, config).includes(creasing.count)) {
          bad.push(`${product.id}/${elem.id}: creasing ${creasing.count}`);
        }
        const corners = allowedRoundedCorners(elem, config);
        for (const corner of roundedCornes.corners) {
          if (!corners.includes(corner)) bad.push(`${product.id}/${elem.id}: corner ${corner}`);
        }
      }
    }
    expect(bad.filter((entry) => !KNOWN_FINISHING_DRIFT.has(entry))).toEqual([]);
    // The recorded exceptions must stay real, or the list quietly outlives the bug.
    expect(bad.filter((entry) => KNOWN_FINISHING_DRIFT.has(entry)).sort()).toEqual([...KNOWN_FINISHING_DRIFT].sort());
  });

  // The premise the bookmark category rests on: both stocks it allows clear every
  // media gate in finishingRules, so no finishing control appears or disappears as
  // the customer switches paper mid-configuration.
  it('offers every bookmark finishing on every stock the category allows', () => {
    const bookmarks = MOCK_CATALOG.products.filter((p) => p.categoryId === 'bookmark');
    expect(bookmarks.length).toBeGreaterThan(0);

    const config = MOCK_CATALOG.config[bookmarks[0].id];
    const elem = bookmarks[0].elementals[0];
    for (const mediaId of config.allowedMediaIds) {
      const media = MOCK_CATALOG.media.find((m) => m.id === mediaId);
      expect(media, `media ${mediaId} missing from the catalog`).toBeDefined();
      const on = { ...elem, media: media! };
      expect(allowedLaminationTypes(on), mediaId).not.toEqual([]);
      expect(allowedCreasingCounts(on, config), mediaId).toEqual([0, 1]);
      expect(allowedRoundedCorners(on, config), mediaId).toEqual([1, 2, 3, 4]);
    }
  });

  // An absent `finishing.staple` under a config that allows stapling is invisible
  // until the customer toggles the control on and then off again: the instance
  // then carries { hole: false, staple: false } while the baseline carries no key
  // at all, so isPersonalized's JSON compare keeps the product flagged
  // "personalizat" and advancedSummary chips a "Capsare: fără" change that was undone.
  it('writes finishing.staple wherever the config allows stapling', () => {
    const missing: string[] = [];
    for (const product of MOCK_CATALOG.products) {
      const config = MOCK_CATALOG.config[product.id];
      if (!config?.allowedStaple) continue;
      for (const elem of product.elementals) {
        if (!elem.finishing.staple) missing.push(`${product.id}/${elem.id}`);
      }
    }
    expect(missing).toEqual([]);
  });

  // Same failure mode as the staple case above, one level up: with `punchHole` on
  // the config, a product literal that omits the key has `undefined` in the
  // baseline while the instance gains an explicit boolean the first time the
  // control is toggled and untoggled — so isPersonalized's JSON compare keeps
  // reporting a change the customer already undid.
  it('writes punchHole on every product whose config offers one', () => {
    const missing: string[] = [];
    for (const product of MOCK_CATALOG.products) {
      const config = MOCK_CATALOG.config[product.id];
      if (!config?.punchHole) continue;
      if (typeof product.punchHole !== 'boolean') missing.push(`${product.id} (${product.label})`);
    }
    expect(missing).toEqual([]);
  });

  // The reverse drift: a product punched with a hole its config never offers
  // prices a hole the customer has no control to remove — ConfigureStage draws
  // the control off `config.punchHole` alone.
  it('never punches a product whose config does not offer a hole', () => {
    const stray = MOCK_CATALOG.products
      .filter((p) => p.punchHole && !MOCK_CATALOG.config[p.id]?.punchHole)
      .map((p) => `${p.id} (${p.label})`);
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
    const check = await freshWarn('warnIfCatalogPredatesRoundedCorners');

    check(preMigrationCatalog('allowedRoundedCorners'));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('allowedRoundedCorners');
    expect(warn.mock.calls[0][0]).toContain('npm run dump:catalog');
  });

  it('warns only once, however many times it is called', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn('warnIfCatalogPredatesRoundedCorners');

    check(preMigrationCatalog('allowedRoundedCorners'));
    check(preMigrationCatalog('allowedRoundedCorners'));
    check(preMigrationCatalog('allowedRoundedCorners'));

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('stays quiet for the real catalog, which declares the field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn('warnIfCatalogPredatesRoundedCorners');

    check(MOCK_CATALOG);

    expect(warn).not.toHaveBeenCalled();
  });

  it('stays quiet when even one config declares the field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn('warnIfCatalogPredatesRoundedCorners');

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
    const check = await freshWarn('warnIfCatalogPredatesRoundedCorners');

    check(withConfigs({}));

    expect(warn).not.toHaveBeenCalled();
  });
});

describe('warnIfCatalogPredatesMachine', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns when no config in the catalog declares machineId', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn('warnIfCatalogPredatesMachine');

    check(preMigrationCatalog('machineId'));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('machineId');
    expect(warn.mock.calls[0][0]).toContain('npm run dump:catalog');
  });

  it('warns only once, however many times it is called', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn('warnIfCatalogPredatesMachine');

    check(preMigrationCatalog('machineId'));
    check(preMigrationCatalog('machineId'));
    check(preMigrationCatalog('machineId'));

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('stays quiet for the real catalog, which declares the field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn('warnIfCatalogPredatesMachine');

    check(MOCK_CATALOG);

    expect(warn).not.toHaveBeenCalled();
  });

  it('stays quiet when even one config declares machineId', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn('warnIfCatalogPredatesMachine');

    check(withConfigs({
      a: { ...MOCK_CATALOG.config['prod0a'] },
      ...preMigrationCatalog('machineId').config,
    }));

    expect(warn).not.toHaveBeenCalled();
  });

  it('stays quiet for an empty catalog rather than crying drift', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const check = await freshWarn('warnIfCatalogPredatesMachine');

    check(withConfigs({}));

    expect(warn).not.toHaveBeenCalled();
  });
});
