import type { Paper, Size, Finishing } from './';

type Elemental = {
  id: string;
  label: string;
  paper: Paper;
  size: Size;
  finishing: Finishing;
};

export type { Elemental };

