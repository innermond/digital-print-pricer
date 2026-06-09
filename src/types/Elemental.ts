import type { Media, Size, Finishing, Printing } from './';

type Elemental = {
  id: string;
  label: string;
  media: Media;
  size: Size;
  pageCount: number;
  printing: Printing;
  finishing: Finishing;
};

export type { Elemental };
