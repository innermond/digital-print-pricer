import { describe, expect, it } from 'vitest';
import { buildSelectionPayload } from '../lib/selection';
import { pocketElemental } from '../lib/pocket';
import { MOCK_CATALOG } from '../data/catalog';

// This payload is a cross-repo contract: the host app (materialpublicitar) prices
// from it. The pocket stopped being an Elemental in the model, but it must keep
// arriving as one on the wire.
const folder = MOCK_CATALOG.products.find((p) => p.id === 'prod3a')!;
const folderConfig = MOCK_CATALOG.config['prod3a'];
const calendar = MOCK_CATALOG.products.find((p) => p.id === 'prod9')!;

describe('buildSelectionPayload', () => {
  it('sends only the real elementals when there is no pocket', () => {
    const payload = buildSelectionPayload(folder);
    expect(payload.elementals).toHaveLength(1);
    expect(payload.elementals[0].label).toBe('Coală A3 cu dublă îndoitură');
  });

  it('appends the pocket as an elemental, exactly as before it became catalog data', () => {
    const pocket = pocketElemental(folderConfig.pocket!, MOCK_CATALOG.media);
    const payload = buildSelectionPayload(folder, pocket);

    expect(payload.elementals).toHaveLength(2);
    expect(payload.elementals[1]).toMatchObject({
      label: 'Buzunar de Hârtie',
      size: { width: 200, height: 120, unit: 'mm' },
      printing: { front: 'none', back: 'none' },
      pageCount: 2,
    });
    expect(payload.elementals[1].media).toMatchObject({ id: 'p6', kind: 'paper' });
  });

  // The host prices a special off its id alone, so this was never a wrong price — but
  // the media object arrived without the `finish` every other kind carries, and the host's
  // other builder (price-table.js) sends it. One wire format, not two.
  it('keeps the finish on a special stock', () => {
    const special = {
      ...folder,
      elementals: folder.elementals.map((e) => ({
        ...e,
        media: MOCK_CATALOG.media.find((m) => m.id === 'p11')!,
      })),
    };

    expect(buildSelectionPayload(special).elementals[0].media).toEqual({
      kind: 'special', id: 'p11', label: '300 GSM - Sirio Pearl White (Luxury)', gsm: 300, finish: 'Matt',
    });
  });

  it('leaves the folder cover untouched by the appended pocket', () => {
    const pocket = pocketElemental(folderConfig.pocket!, MOCK_CATALOG.media);
    expect(buildSelectionPayload(folder, pocket).elementals[0].label).toBe('Coală A3 cu dublă îndoitură');
    expect(folder.elementals).toHaveLength(1);
  });

  it('sends the chosen crease count and not the catalog cap', () => {
    // `creasing.max` is a constraint the catalog puts on the part, not something
    // the customer picked — it must not reach the price endpoint.
    const capped = {
      ...folder,
      elementals: folder.elementals.map((e) => ({
        ...e,
        finishing: { ...e.finishing, creasing: { count: 2, max: 4 } },
      })),
    };
    const creasing = buildSelectionPayload(capped).elementals[0].finishing.creasing;
    expect(creasing).toEqual({ count: 2 });
    expect(creasing).not.toHaveProperty('max');
  });

  it('sends a spiral binding but not an explicit "no binding"', () => {
    // `{ type: 'none' }` is what BindingControl's "Fără" writes. It is a real
    // Binding, but on the wire it must be indistinguishable from never having
    // chosen one — the host has always read `binding`'s absence as unbound.
    const spiral = { ...folder, binding: { type: 'spiral', color: 'white' } as const };
    expect(buildSelectionPayload(spiral)).toHaveProperty('binding', { type: 'spiral', color: 'white' });

    const cleared = { ...folder, binding: { type: 'none' } as const };
    expect(buildSelectionPayload(cleared)).not.toHaveProperty('binding');
    expect(buildSelectionPayload(folder)).not.toHaveProperty('binding');
  });

  it('sends the punched hanging hole of a calendar', () => {
    expect(buildSelectionPayload(calendar)).toHaveProperty('punchHole', true);
  });

  it('sends an excluded hole as false rather than dropping it', () => {
    // Unlike the binding, the hole stays on the wire when it is off: a calendar
    // the customer un-punched is a different job from one that never offered a
    // hole, and the host prices the two apart.
    const unpunched = { ...calendar, punchHole: false };
    expect(buildSelectionPayload(unpunched)).toHaveProperty('punchHole', false);
  });

  it('sends false for a product that has no hole on offer', () => {
    expect(buildSelectionPayload(folder)).toHaveProperty('punchHole', false);
  });
});
