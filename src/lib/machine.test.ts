import { describe, expect, it } from 'vitest';
import { resolveMachine, fitsMachine, maxSideMm, maxSideUnfoldedMm } from './machine';
import { unfoldedSizeMm } from './foldUtils';
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

describe('maxSideUnfoldedMm', () => {
  const press = makeMachine({ maxWidthMm: 320, maxHeightMm: 450 });

  it('answers exactly like maxSideMm when nothing is folded', () => {
    for (const other of [100, 210, 297, 320, 450, 500]) {
      expect(maxSideUnfoldedMm(other, 1, press)).toBe(maxSideMm(other, press));
    }
  });

  it('has no ceiling to give without a machine', () => {
    expect(maxSideUnfoldedMm(210, 3, undefined)).toBeUndefined();
  });

  it('leaves room for an A4 half-fold but not an A4 tri-fold', () => {
    // Beside a height of 297: half-folded, the width may run to 225 (450 open);
    // tri-folded, only to 150 — which is why an A4 tri-fold cannot be printed.
    expect(maxSideUnfoldedMm(297, 2, press)).toBe(225);
    expect(maxSideUnfoldedMm(297, 3, press)).toBe(150);
  });

  it('lets the fixed side run long once the other one is the edge that grows', () => {
    // Beside a width of 210, the height passes 210 and becomes the long edge, so
    // the width is what doubles: 420 open, leaving the height the press's 320.
    expect(maxSideUnfoldedMm(210, 2, press)).toBe(320);
  });

  it('never returns a cap the press cannot actually take', () => {
    for (const factor of [2, 3, 4]) {
      for (const other of [50, 100, 148, 210, 297, 320]) {
        const cap = maxSideUnfoldedMm(other, factor, press)!;
        const at = unfoldedSizeMm(cap, other, factor);
        expect(fitsMachine(at.widthMm, at.heightMm, press)).toBe(true);
        const past = unfoldedSizeMm(cap + 1, other, factor);
        expect(fitsMachine(past.widthMm, past.heightMm, press)).toBe(false);
      }
    }
  });

  it('keeps the field usable when the other side alone is already too big', () => {
    // Nothing fits at 500mm, but a cap of 0 would pin the input shut — pulling
    // the other side back down has to be able to recover.
    expect(maxSideUnfoldedMm(500, 2, press)).toBeGreaterThan(0);
  });
});
