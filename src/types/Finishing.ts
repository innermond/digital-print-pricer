type LaminationSides =
  | "front"
  | "back"
  | "both";

type LaminationType =
  | "none"
  | "gloss"
  | "matt"
  | "soft-touch";

type FoldingType =
  | "none"
  | "half-fold"
  | "tri-fold"
  | "z-fold"
  | "gate-fold"
  | "custom";

type Finishing = {
  lamination: {
    type: LaminationType;
    sides: LaminationSides;
  };

  folding: {
    type: FoldingType;
    folds: number;
  };

  creasing: {
    count: number;
  };

  roundedCornes: {
    count: 0 | 1 | 2 | 3 | 4;
  };
};

export type { LaminationType, LaminationSides, FoldingType, Finishing };
