import type  { Elemental } from './';

type Product = {
  id: string;
  label: string;
  amount: number;
  elementals: Elemental[]; 
};

export type { Product };
