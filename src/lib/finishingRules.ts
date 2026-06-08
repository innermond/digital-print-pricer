import type { Elemental } from '../types';

export const allowedLaminationTypes = (elem: Elemental) => {
  if (elem.paper.gsm < 170) return false;
  if (['elem3-2'].includes(elem.id)) return false;
  return true;
};

export const allowedCreasingTypes = (elem: Elemental) => {
  if (elem.paper.gsm < 200) return false;
  if (['elem4-1', 'elem3-2'].includes(elem.id)) return false;
  return true;
};

export const allowedRoundedCorners = (elem: Elemental) => {
  if (elem.paper.gsm < 170) return false;
  if (['elem3-1', 'elem3-2'].includes(elem.id)) return false;
  return true;
};
