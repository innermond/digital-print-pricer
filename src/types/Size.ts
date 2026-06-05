type SizeUnit = "mm" | "in" | "pt";

type Size = {
  id: string;
  label: string;
  width: number;
  height: number;
  unit: SizeUnit;
};

export type { SizeUnit, Size };
