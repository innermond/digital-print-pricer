import type { Elemental } from '../../types';
import type { ProductConfig } from '../../data/mockData';
import {
  allowedLaminationTypes,
  allowedCreasingCounts,
  allowedRoundedCorners,
} from '../../lib/finishingRules';
import { LaminationControl } from './LaminationControl';
import { FoldingControl } from './FoldingControl';
import { CreasingControl } from './CreasingControl';
import { RoundedCornersControl } from './RoundedCornersControl';
import { Badge } from '../Badge';

type FinishingOptionsProps = {
  element: Elemental;
  config: ProductConfig;
  onUpdate: (updates: Partial<Elemental>) => void;
  badgeText?: string;
};

export function FinishingOptions({ element, config, onUpdate, badgeText }: FinishingOptionsProps) {
  const { finishing } = element;

  const widget = (
    <div>
      <label className="block text-xs font-semibold text-slate-900 dark:text-slate-50 mb-2">
        Finishing
      </label>
      <div className="space-y-2.5">
        <LaminationControl
          lamination={finishing.lamination}
          allowedTypes={allowedLaminationTypes(element)}
          onChange={(lamination) => onUpdate({ finishing: { ...finishing, lamination } })}
        />
        <FoldingControl
          folding={finishing.folding}
          allowedFoldTypes={config.allowedFoldTypes}
          onChange={(folding) => onUpdate({ finishing: { ...finishing, folding } })}
        />
        <CreasingControl
          count={finishing.creasing.count}
          allowedCounts={allowedCreasingCounts(element)}
          onChange={(count) => onUpdate({ finishing: { ...finishing, creasing: { count } } })}
        />
        <RoundedCornersControl
          corners={finishing.roundedCornes.corners}
          allowedCorners={allowedRoundedCorners(element)}
          onChange={(corners) => onUpdate({ finishing: { ...finishing, roundedCornes: { corners } } })}
        />
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
