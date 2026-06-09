import type { Paper, Size, Finishing, Printing } from './';

type Elemental = {
  id: string;
  label: string;
  paper: Paper;
  size: Size;
  pageCount: number;
  printing: Printing;
  finishing: Finishing;
};

export type { Elemental };

