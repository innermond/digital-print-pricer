type PaperFinish = "Gloss" | "Silk" | "Matt" | "Soft-touch" | "Sticker-Gloss" | "Sticker-Matt" | "Sticker-Clear" | "Sticker-Kraft";
type PaperWeight = 80 | 130 | 170 | 200 | 250 | 350;

type Paper = {
  id: string;
  label: string;
  gsm: PaperWeight;
  finish: PaperFinish;
  explanation?: string;
};

export type { PaperWeight, PaperFinish, Paper };
