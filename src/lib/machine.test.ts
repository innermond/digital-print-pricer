import { describe, expect, it } from 'vitest';
import { resolveMachine, fitsMachine, maxSideMm } from './machine';
import { makeConfig, makeMachine } from '../test/fixtures';

describe('resolveMachine', () => {
  it('finds the machine a config points at', () => {
    const machine = makeMachine({ id: 'm1' });
    expect(resolveMachine(makeConfig({ machineId: 'm1' }), [machine])).toBe(machine);
  });

  it('returns undefined when the config declares no machineId', () => {
    expect(resolveMachine(makeConfig(), [makeMachine()])).toBeUndefined();
  });

  it('returns undefined for a machineId absent from the catalog', () => {
    expect(resolveMachine(makeConfig({ machineId: 'missing' }), [makeMachine({ id: 'm1' })])).toBeUndefined();
  });
});

describe('fitsMachine', () => {
  it('fits everything when there is no machine', () => {
    expect(fitsMachine(10_000, 10_000, undefined)).toBe(true);
  });

  it('fits a size exactly at the ceiling', () => {
    const machine = makeMachine({ maxWidthMm: 320, maxHeightMm: 450 });
    expect(fitsMachine(320, 450, machine)).toBe(true);
  });

  it('rejects a size over width', () => {
    const machine = makeMachine({ maxWidthMm: 320, maxHeightMm: 450 });
    expect(fitsMachine(321, 450, machine)).toBe(false);
  });

  it('rejects a size over height', () => {
    const machine = makeMachine({ maxWidthMm: 320, maxHeightMm: 450 });
    expect(fitsMachine(320, 451, machine)).toBe(false);
  });

  it('takes a sheet the press can feed the other way round', () => {
    // The press is 320×450. An A3 turned sideways is 420×297 — wider than the
    // press's 320 "width", but the same piece of paper as a 297×420 that fits.
    const machine = makeMachine({ maxWidthMm: 320, maxHeightMm: 450 });
    expect(fitsMachine(297, 420, machine)).toBe(true);
    expect(fitsMachine(420, 297, machine)).toBe(true);
    expect(fitsMachine(450, 320, machine)).toBe(true);
  });

  it('still rejects a sheet too big in either orientation', () => {
    const machine = makeMachine({ maxWidthMm: 320, maxHeightMm: 450 });
    // 451 is past the long edge whichever way round it is fed.
    expect(fitsMachine(451, 320, machine)).toBe(false);
    // Both edges over the short one: no orientation helps.
    expect(fitsMachine(400, 400, machine)).toBe(false);
  });
});

describe('maxSideMm', () => {
  const machine = makeMachine({ maxWidthMm: 320, maxHeightMm: 450 });

  it('has no ceiling without a machine', () => {
    expect(maxSideMm(210, undefined)).toBeUndefined();
  });

  it('allows the press long edge when the other side is the short one', () => {
    expect(maxSideMm(210, machine)).toBe(450);
    expect(maxSideMm(320, machine)).toBe(450);
  });

  it('caps at the press short edge once the other side is the long one', () => {
    expect(maxSideMm(400, machine)).toBe(320);
  });

  it('keeps the field usable for a sheet that cannot fit at all', () => {
    expect(maxSideMm(9_000, machine)).toBe(320);
  });
});
