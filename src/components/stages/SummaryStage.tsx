import type { Product, Elemental } from '../../types';
import type { ProductConfig } from '../../data/mockData';
import { PreviewCard } from '../PreviewCard';
import { AssemblySummary } from '../AssemblySummary';

type SummaryStageProps = {
  product: Product | undefined;
  element: Elemental | undefined;
  pocket: ProductConfig['pocket'];
  personalized: boolean;
};

export function SummaryStage({ product, element, pocket, personalized }: SummaryStageProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-72"><PreviewCard element={element} /></div>
      <div className="flex-1 min-w-72">
        <AssemblySummary product={product} personalized={personalized} pocket={pocket} />
      </div>
    </div>
  );
}
