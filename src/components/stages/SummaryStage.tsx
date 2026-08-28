import type { Product, Elemental, Size } from '../../types';
import type { ProductConfig } from '../../data/mockData';
import { PreviewCard } from '../PreviewCard';
import { AssemblySummary } from '../AssemblySummary';

type SummaryStageProps = {
  product: Product | undefined;
  element: Elemental | undefined;
  pocket: ProductConfig['pocket'];
  punchHole?: boolean;
  foldedInHalf?: boolean;
  personalized: boolean;
  sizes?: Size[];
};

export function SummaryStage({ product, element, pocket, punchHole, foldedInHalf, personalized, sizes }: SummaryStageProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-72">
        <PreviewCard
          element={element}
          binding={product?.binding}
          pocket={pocket}
          punchHole={punchHole}
          foldedInHalf={foldedInHalf}
          presets={sizes}
        />
      </div>
      <div className="flex-1 min-w-72">
        <AssemblySummary product={product} personalized={personalized} pocket={pocket} punchHole={punchHole} />
      </div>
    </div>
  );
}
