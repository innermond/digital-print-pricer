import type { Elemental } from '../../types';
import type { ProductConfig } from '../../data/mockData';
import {
  allowedLaminationTypes,
  allowedLaminationSides,
  allowedCreasingCounts,
  allowedRoundedCorners,
} from '../../lib/finishingRules';
import { derivedPageCount } from '../../lib/foldUtils';
import { LaminationControl } from './LaminationControl';
import { FoldingControl } from './FoldingControl';
import { CreasingControl } from './CreasingControl';
import { RoundedCornersControl } from './RoundedCornersControl';
import { StapleControl } from './StapleControl';
import { Badge } from '../Badge';

type FinishingOptionsProps = {
  element: Elemental;
  config: ProductConfig;
  onUpdate: (updates: Partial<Elemental>) => void;
  badgeText?: string;
};

export function FinishingOptions({ element, config, onUpdate, badgeText }: FinishingOptionsProps) {
  const { finishing } = element;

  const creasingCounts = allowedCreasingCounts(element);
  const roundedCorners = allowedRoundedCorners(element);

  const widget = (
    <div>
      <label className="block text-xs font-semibold text-slate-900 dark:text-slate-50 mb-2">
        Finisare
      </label>
      <div className="flex flex-wrap items-start gap-2">
        <LaminationControl
          lamination={finishing.lamination}
          allowedTypes={allowedLaminationTypes(element)}
          allowedSides={allowedLaminationSides(config)}
          onChange={(lamination) => onUpdate({ finishing: { ...finishing, lamination } })}
        />
        <FoldingControl
          folding={finishing.folding}
          allowedFoldTypes={config.allowedFoldTypes}
          onChange={(folding) => {
            const pageCountConstraint = config.elementalPageCounts?.[element.id];
            const updates: Partial<Elemental> = { finishing: { ...finishing, folding } };
            if (pageCountConstraint?.kind === 'derived') {
              updates.pageCount = derivedPageCount(folding.type);
            }
            onUpdate(updates);
          }}
        />
        {creasingCounts.length > 0 && (
          <CreasingControl
            count={finishing.creasing.count}
            allowedCounts={creasingCounts}
            onChange={(count) => onUpdate({ finishing: { ...finishing, creasing: { count } } })}
          />
        )}
        {roundedCorners.length > 0 && (
          <RoundedCornersControl
            corners={finishing.roundedCornes.corners}
            allowedCorners={roundedCorners}
            onChange={(corners) => onUpdate({ finishing: { ...finishing, roundedCornes: { corners } } })}
          />
        )}
        {config.allowedStaple && (
          <StapleControl
            staple={finishing.staple}
            allowed={config.allowedStaple}
            onChange={(staple) => onUpdate({ finishing: { ...finishing, staple } })}
          />
        )}
      </div>
    </div>
  );

  return badgeText ? <Badge text={badgeText}>{widget}</Badge> : widget;
}
