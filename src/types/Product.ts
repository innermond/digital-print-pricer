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
  // Whether the catalog's punched hanging hole (see ProductConfig.punchHole) is
  // included on this instance. Unlike the pocket, undefined means off: a product
  // that offers a hole opts in explicitly on its literal, so a catalog that
  // predates this field never starts pricing a hole into anything.
  punchHole?: boolean;
};

export type { Product };
