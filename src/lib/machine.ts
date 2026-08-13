import type { Machine } from '../types';
import type { ProductConfig } from '../data/mockData';

// The printing machine a product's config points at, or undefined when the
// catalog doesn't declare one (see warnIfCatalogPredatesMachine).
export const resolveMachine = (config: ProductConfig | undefined, machines: Machine[]): Machine | undefined =>
  machines.find((m) => m.id === config?.machineId);

// Whether a size is within the machine's max width/height. No machine means
// no ceiling — everything fits.
export const fitsMachine = (widthMm: number, heightMm: number, machine: Machine | undefined): boolean =>
  !machine || (widthMm <= machine.maxWidthMm && heightMm <= machine.maxHeightMm);
