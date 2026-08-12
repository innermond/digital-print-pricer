// The three stages of the flow. Kept out of the component file so importing
// them doesn't break React Fast Refresh.
export const STAGES = [
  { title: 'Produs' },
  { title: 'Configurare' },
  { title: 'Ofertă' },
] as const;

export type StageIndex = 0 | 1 | 2;
