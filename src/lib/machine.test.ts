import { describe, expect, it } from 'vitest';
import { resolveMachine, fitsMachine } from './machine';
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
});
