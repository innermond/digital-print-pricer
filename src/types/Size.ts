type SizeUnit = "mm" | "in" | "pt";

type Size = {
  id: string;
  label: string;
  width: number;
  height: number;
  unit: SizeUnit;
  widthMm: number;
  heightMm: number;
};

export type { SizeUnit, Size };
