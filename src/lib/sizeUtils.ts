import type { SizeUnit } from '../types';

const UNIT_TO_MM = {
  mm: 1,
  in: 25.4,
  pt: 0.352778,
};

const MM_TO_UNIT = {
  mm: 1,
  in: 1 / 25.4,
  pt: 1 / 0.352778,
};

export const convertSize = (value: number, fromUnit: SizeUnit, toUnit: SizeUnit) => {
  const inMM = value * UNIT_TO_MM[fromUnit];
  const result = inMM * MM_TO_UNIT[toUnit];
  return Math.round(result * 100) / 100;
};
