import type  { Elemental, Binding } from './';

type Product = {
  id: string;
  categoryId: string;
  label: string;
  amount: number;
  elementals: Elemental[];
  binding?: Binding;
  // Whether the catalog's pocket (see ProductConfig.pocket) is included on this
  // instance. Undefined means on — every product with a pocket on offer shows
  // it by default, same as before this field existed.
  pocketEnabled?: boolean;
};

export type { Product };
