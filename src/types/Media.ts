type PaperFinish = "Gloss" | "Silk" | "Matt" | "Soft-touch";
type PaperWeight = 80 | 130 | 170 | 200 | 250 | 350;

type Paper = {
  kind: 'paper';
  id: string;
  label: string;
  gsm: PaperWeight;
  finish: PaperFinish;
  explanation?: string;
};

type StickerFace = "Gloss" | "Matt" | "Clear" | "Kraft";

type Sticker = {
  kind: 'sticker';
  id: string;
  label: string;
  gsm: number;
  face: StickerFace;
  explanation?: string;
};

type Media = Paper | Sticker;

export type { PaperFinish, PaperWeight, Paper, StickerFace, Sticker, Media };
