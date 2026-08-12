import { useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const BADGE_POSITION_CLASSES: Record<BadgePosition, string> = {
  'top-left':     'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
  'top-right':    'top-0 right-0 translate-x-1/2 -translate-y-1/2',
  'bottom-left':  'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
};

type BadgeProps = {
  children: ReactNode;
  label?: ReactNode;
  text: string;
  position?: BadgePosition;
};

const GAP = 6;
const MARGIN = 8;

export function Badge({ children, label, text, position = 'top-right' }: BadgeProps) {
  const [panelStyle, setPanelStyle] = useState<CSSProperties | null>(null);
  // Click/tap pins the panel open. Hover alone left the help unreachable on
  // touch devices, where there is no hover at all.
  const [pinned, setPinned] = useState(false);
  const panelId = useId();
  const badgeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

  const position_ = () => {
    const badgeEl = badgeRef.current;
    const panelEl = panelRef.current;
    if (!badgeEl || !panelEl) { setPanelStyle({}); return; }

    const badgeRect = badgeEl.getBoundingClientRect();
    const { width: panelW, height: panelH } = panelEl.getBoundingClientRect();

    const maxWidth = Math.min(300, document.documentElement.clientWidth - 2 * MARGIN);
    const effectiveW = Math.min(panelW, maxWidth);

    // Vertical: prefer above, fall back below when no room
    const topViewport = badgeRect.top - panelH - GAP >= 0
      ? badgeRect.top - panelH - GAP
      : badgeRect.bottom + GAP;

    // Horizontal: center on badge, clamped to keep panel inside viewport
    const leftViewport = Math.max(
      MARGIN,
      Math.min(
        badgeRect.left + badgeRect.width / 2 - effectiveW / 2,
        document.documentElement.clientWidth - effectiveW - MARGIN,
      ),
    );

    // Convert from viewport coords to badge-element-relative offset
    setPanelStyle({
      top:      topViewport - badgeRect.top,
      left:     leftViewport - badgeRect.left,
      maxWidth,
    });
  };

  const hide = () => {
    if (pinned) return; // a pinned panel stays until dismissed
    setPanelStyle(null);
  };

  const open = panelStyle !== null;

  return (
    <span className="flex-grow flex-shrink relative inline-flex">
      <button
        ref={badgeRef}
        type="button"
        aria-label="Detalii"
        aria-expanded={open}
        aria-describedby={open ? panelId : undefined}
        onMouseEnter={position_}
        onMouseLeave={hide}
        onFocus={position_}
        onBlur={() => { setPinned(false); setPanelStyle(null); }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (pinned) { setPinned(false); setPanelStyle(null); return; }
          setPinned(true);
          position_();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setPinned(false); setPanelStyle(null); }
        }}
        className={`absolute z-10 inline-flex items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-[10px] font-semibold leading-none text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${BADGE_POSITION_CLASSES[position]}`}
      >
        {label ?? 'ⓘ'}
        <span
          ref={panelRef}
          id={panelId}
          role="tooltip"
          style={panelStyle ?? {}}
          // Pointer events stay off while hovering (so the panel can't steal the
          // mouse) but come back once pinned, making its scrollbar usable.
          className={`${pinned ? '' : 'pointer-events-none'} absolute z-20 w-max break-words rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-normal normal-case text-slate-700 dark:text-slate-200 shadow-md max-w-[300px] max-h-[min(400px,95vh)] overflow-auto ${
            panelStyle ? '' : 'invisible'
          }`}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </button>
      {children}
    </span>
  );
}
