// Romanian display labels for the values that travel as English identifiers.
// These maps were duplicated across AssemblySummary, PreviewCard and
// MediaSelector; keep them here so a wording change lands once.

export const LAMINATION_RO: Record<string, string> = {
  none: 'Fără', gloss: 'Lucios', matt: 'Mat', 'soft-touch': 'Soft-touch',
};

export const LAMINATION_SIDES_RO: Record<string, string> = {
  front: 'față', back: 'verso', both: 'ambele fețe',
};

export const FOLD_RO: Record<string, string> = {
  none: 'Fără', 'half-fold': 'La jumătate', 'tri-fold': 'În trei', 'z-fold': 'Z', 'gate-fold': 'Poartă',
};

export const SPIRAL_COLOR_RO: Record<string, string> = {
  white: 'Alb', black: 'Negru',
};

export const CORNER_RO: Record<number, string> = {
  1: 'Stânga sus', 2: 'Dreapta sus', 3: 'Stânga jos', 4: 'Dreapta jos',
};

/** Romanian noun agreement for a count, e.g. 1 element / 3 elemente. */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
