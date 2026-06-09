type PrintInk = 'color' | 'black';

type Printing = {
  front: PrintInk;
  back: PrintInk | 'none';
};

export type { PrintInk, Printing };
