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
    // What the customer chose. The slider writes this.
    count: number;
    // Catalog data: the most creases this part may take, overriding the
    // product's allowedCreasingCounts. Inclusive — 2 offers 0, 1 or 2. Kept
    // separate from `count` so choosing a value can never narrow the range it
    // was chosen from.
    max?: number;
  };

  roundedCornes: {
    corners: RoundedCorner[];
  };

  staple?: Staple;
};

export type { LaminationType, LaminationSides, FoldingType, RoundedCorner, Staple, Finishing };
