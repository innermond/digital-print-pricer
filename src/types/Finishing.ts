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
    // Catalog data: the fewest/most creases this part may take, overriding the
    // product's allowedCreasingCounts. Inclusive on both ends — min: 1, max: 3
    // offers 1, 2 or 3. Omitted min is 0. Kept separate from `count` so
    // choosing a value can never narrow the range it was chosen from.
    min?: number;
    max?: number;
  };

  roundedCornes: {
    corners: RoundedCorner[];
  };

  staple?: Staple;
};

export type { LaminationType, LaminationSides, FoldingType, RoundedCorner, Staple, Finishing };
