import type { SizeUnit } from './Size';
import type { Printing } from './Printing';

// A paper pocket glued inside a presentation folder. Like spiral binding, it is a
// stock item the catalog either includes or doesn't — never something the customer
// specs — so it lives on ProductConfig rather than being an Elemental. The physical
// details are kept here only so the price payload can still describe it.
type Pocket = {
  label: string;
  mediaId: string;
  width: number;
  height: number;
  unit: SizeUnit;
  pageCount: number;
  printing: Printing;
};

export type { Pocket };
