type SpiralColor = 'white' | 'black';

type BindingType = 'none' | 'spiral';

type Binding =
  | { type: 'none' }
  | { type: 'spiral'; color: SpiralColor };

export type { SpiralColor, BindingType, Binding };
