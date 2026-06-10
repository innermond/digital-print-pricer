type PrintInk = 'color' | 'black';

type Printing = {
  front: PrintInk | 'none';
  back: PrintInk | 'none';
};

export type { PrintInk, Printing };
