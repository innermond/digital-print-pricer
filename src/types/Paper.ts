type PaperFinish = "Gloss" | "Silk" | "Matt" | "Soft-touch";
type PaperWeight = 80 | 130 | 170 | 200 | 250 | 350;

type Paper = {
  id: string;
  label: string;
  gsm: PaperWeight;
  finish: PaperFinish;
};

export type { PaperWeight, PaperFinish, Paper };
