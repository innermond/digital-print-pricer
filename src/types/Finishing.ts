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

// 1 = top-left, 2 = top-right, 3 = bottom-left, 4 = bottom-right
type RoundedCorner = 1 | 2 | 3 | 4;

type Staple = {
  hole: boolean;
  staple: boolean;
};

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
    corners: RoundedCorner[];
  };

  staple?: Staple;
};

export type { LaminationType, LaminationSides, FoldingType, RoundedCorner, Staple, Finishing };
