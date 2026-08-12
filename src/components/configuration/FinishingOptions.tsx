import type { Elemental } from '../../types';
import type { ProductConfig } from '../../data/mockData';
import {
  allowedLaminationTypes,
  allowedLaminationSides,
  allowedFoldTypes,
  allowedCreasingCounts,
  allowedRoundedCorners,
  hasFinishingOptions,
} from '../../lib/finishingRules';
import { derivedPageCount } from '../../lib/foldUtils';
import { LaminationControl } from './LaminationControl';
import { FoldingControl } from './FoldingControl';
import { CreasingControl } from './CreasingControl';
import { RoundedCornersControl } from './RoundedCornersControl';
import { StapleControl } from './StapleControl';
import { useId } from 'react';
import { Badge } from '../Badge';

type FinishingOptionsProps = {
  element: Elemental;
  config: ProductConfig;
  onUpdate: (updates: Partial<Elemental>) => void;
  badgeText?: string;
};

export function FinishingOptions({ element, config, onUpdate, badgeText }: FinishingOptionsProps) {
  const headingId = useId();
  const { finishing } = element;

  const laminationTypes = allowedLaminationTypes(element);
  const foldTypes = allowedFoldTypes(config);
  const creasingCounts = allowedCreasingCounts(element, config);
  const roundedCorners = allowedRoundedCorners(element);

  // Every sub-control can be ruled out at once (e.g. a 120 GSM flyer). Drop the
  // whole section rather than leaving a "Finisare" heading over nothing.
  if (!hasFinishingOptions(element, config)) return null;

  const widget = (
    <div role="group" aria-labelledby={headingId}>
      <h3 id={headingId} className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
        Finisare
      </h3>
      {/* A predictable two-column grid rather than a wrapped pile: each
          sub-control keeps its own width and stays scannable. */}
      <div className="grid gap-3 sm:grid-cols-2">
        {laminationTypes.length > 0 && (
          <LaminationControl
            lamination={finishing.lamination}
            allowedTypes={laminationTypes}
            allowedSides={allowedLaminationSides(config)}
            onChange={(lamination) => onUpdate({ finishing: { ...finishing, lamination } })}
          />
        )}
        {/* The unfiltered list goes to the control so 'Fără' stays clickable — foldTypes
            only decides whether the panel is worth showing at all. */}
        {foldTypes.length > 0 && (
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
        )}
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
