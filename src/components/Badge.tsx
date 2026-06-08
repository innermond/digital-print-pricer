import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const BADGE_POSITION_CLASSES: Record<BadgePosition, string> = {
  'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
  'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
  'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
};

const PANEL_POSITION_CLASSES: Record<BadgePosition, string> = {
  'top-left': 'bottom-full left-0 mb-1.5',
  'top-right': 'bottom-full right-0 mb-1.5',
  'bottom-left': 'top-full left-0 mt-1.5',
  'bottom-right': 'top-full right-0 mt-1.5',
};

type BadgeProps = {
  children: ReactNode;
  label?: ReactNode;
  text: string;
  position?: BadgePosition;
};

// Picks the side of `position` that keeps the panel inside the viewport, given
// where the badge currently sits and how big the panel is.
const fitPosition = (
  preferred: BadgePosition,
  badgeRect: DOMRect,
  panelRect: DOMRect,
): BadgePosition => {
  const [vertical, horizontal] = preferred.split('-') as ['top' | 'bottom', 'left' | 'right'];

  const fitsAbove = badgeRect.top - panelRect.height >= 0;
  const fitsBelow = badgeRect.bottom + panelRect.height <= window.innerHeight;
  let nextVertical = vertical;
  if (vertical === 'top' && !fitsAbove && fitsBelow) {
    nextVertical = 'bottom';
  } else if (vertical === 'bottom' && !fitsBelow && fitsAbove) {
    nextVertical = 'top';
  }

  const fitsLeftAligned = badgeRect.left + panelRect.width <= window.innerWidth;
  const fitsRightAligned = badgeRect.right - panelRect.width >= 0;
  let nextHorizontal = horizontal;
  if (horizontal === 'left' && !fitsLeftAligned && fitsRightAligned) {
    nextHorizontal = 'right';
  } else if (horizontal === 'right' && !fitsRightAligned && fitsLeftAligned) {
    nextHorizontal = 'left';
  }

  return `${nextVertical}-${nextHorizontal}`;
};

// ============ BADGE ============
export function Badge({ children, label, text, position = 'top-right' }: BadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<BadgePosition>(position);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

  const handleEnter = () => {
    const badgeEl = badgeRef.current;
    const panelEl = panelRef.current;
    if (badgeEl && panelEl) {
      setPanelPosition(fitPosition(position, badgeEl.getBoundingClientRect(), panelEl.getBoundingClientRect()));
    }
    setIsOpen(true);
  };

  return (
    <span className="relative inline-flex">
      {children}
      <span
        ref={badgeRef}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setIsOpen(false)}
        className={`absolute z-10 inline-flex items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm ${BADGE_POSITION_CLASSES[position]}`}
      >
        {label ?? 'ⓘ'}
        <span
          ref={panelRef}
          className={`pointer-events-none absolute z-20 w-max overflow-auto break-words rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-normal normal-case text-slate-700 dark:text-slate-200 shadow-md max-w-[min(300px,95vw)] max-h-[min(400px,95vh)] ${
            isOpen ? '' : 'invisible'
          } ${PANEL_POSITION_CLASSES[panelPosition]}`}
          dangerouslySetInnerHTML={{__html: text}}
        />
      </span>
    </span>
  );
}
