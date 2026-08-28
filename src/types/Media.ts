type PaperFinish = "Gloss" | "Silk" | "Matt" | "Soft-touch";
// Real stock weights (RON market) — match the price engine's paper keys exactly.
// 300 was missing here while the catalog shipped a 300 GSM stock (p5), which
// broke `tsc -b`; `tsc --noEmit` hid it because the root tsconfig is a
// project-references solution and emits nothing to check.
type PaperWeight = 90 | 120 | 150 | 200 | 250 | 300 | 350;

type Paper = {
  kind: 'paper';
  id: string;
  label: string;
  gsm: PaperWeight;
  finish: PaperFinish;
  explanation?: string;
};

type Special = {
  kind: 'special';
  id: string;
  label: string;
  gsm: PaperWeight;
  finish: PaperFinish;
  explanation?: string;
};

type StickerFace = "Gloss" | "Matt" | "Clear" | "PVC";

type Sticker = {
  kind: 'sticker';
  id: string;
  label: string;
  gsm: number;
  face: StickerFace;
  explanation?: string;
};

type Media = Paper | Special | Sticker;

export type { PaperFinish, PaperWeight, Paper, Special, StickerFace, Sticker, Media };
