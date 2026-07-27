import { describe, expect, it } from 'vitest';
import { buildSelectionPayload } from './ProductConfigurator';
import { pocketElemental } from '../lib/pocket';
import { MOCK_CATALOG } from '../data/catalog';

// This payload is a cross-repo contract: the host app (materialpublicitar) prices
// from it. The pocket stopped being an Elemental in the model, but it must keep
// arriving as one on the wire.
const folder = MOCK_CATALOG.products.find((p) => p.id === 'prod3a')!;
const folderConfig = MOCK_CATALOG.config['prod3a'];

describe('buildSelectionPayload', () => {
  it('sends only the real elementals when there is no pocket', () => {
    const payload = buildSelectionPayload(folder);
    expect(payload.elementals).toHaveLength(1);
    expect(payload.elementals[0].label).toBe('Coală A3 Pliată');
  });

  it('appends the pocket as an elemental, exactly as before it became catalog data', () => {
    const pocket = pocketElemental(folderConfig.pocket!, MOCK_CATALOG.media);
    const payload = buildSelectionPayload(folder, pocket);

    expect(payload.elementals).toHaveLength(2);
    expect(payload.elementals[1]).toMatchObject({
      label: 'Buzunar de Hârtie',
      size: { width: 200, height: 120, unit: 'mm' },
      printing: { front: 'black', back: 'none' },
      pageCount: 2,
    });
    expect(payload.elementals[1].media).toMatchObject({ id: 'p6', kind: 'paper' });
  });

  it('leaves the folder cover untouched by the appended pocket', () => {
    const pocket = pocketElemental(folderConfig.pocket!, MOCK_CATALOG.media);
    expect(buildSelectionPayload(folder, pocket).elementals[0].label).toBe('Coală A3 Pliată');
    expect(folder.elementals).toHaveLength(1);
  });
});
