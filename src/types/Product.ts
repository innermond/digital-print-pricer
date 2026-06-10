import type  { Elemental, Binding } from './';

type Product = {
  id: string;
  categoryId: string;
  label: string;
  amount: number;
  elementals: Elemental[];
  binding?: Binding;
};

export type { Product };
