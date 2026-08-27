import { useId, useLayoutEffect, useRef, useState } from 'react';
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
  // Stretch to fill its flex row like a "card" button would. Off by default —
  // most badged buttons are compact/content-sized, and stretching pulls the
  // badge (positioned off this wrapper's own corner) away from the visible
  // button toward the edge of the row instead.
  grow?: boolean;
};

const GAP = 6;
const MARGIN = 8;

export function Badge({ children, label, text, position = 'top-right', grow = false }: BadgeProps) {
  // The panel is rendered ONLY while `open`. It used to sit in the DOM permanently,
  // hidden with `visibility: hidden` so it stayed measurable — but a visibility-hidden
  // box still occupies layout, and a `w-max` panel parked at its unpositioned spot
  // hangs past the right edge. A page with 17 badges pushed a 375px phone viewport out
  // to 476px and gave the whole site a horizontal scrollbar. Unmounting it costs
  // nothing until someone actually asks for help.
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties | null>(null);
  // Click/tap pins the panel open. Hover alone left the help unreachable on
  // touch devices, where there is no hover at all.
  const [pinned, setPinned] = useState(false);
  const panelId = useId();
  const badgeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

  // useLayoutEffect, not an event handler: the panel has to be in the DOM before it can
  // be measured, and this runs after that render but before paint, so it is never seen
  // at its unpositioned spot. Measuring in the handler (as this did) is what forced the
  // panel to be permanently mounted in the first place.
  useLayoutEffect(() => {
    if (!open) { setPanelStyle(null); return; }

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
  }, [open]);

  const hide = () => {
    if (pinned) return; // a pinned panel stays until dismissed
    setOpen(false);
  };

  return (
    <span className={`relative inline-flex ${grow ? 'flex-grow flex-shrink' : ''}`}>
      <button
        ref={badgeRef}
        type="button"
        aria-label="Detalii"
        aria-expanded={open}
        aria-describedby={open ? panelId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={hide}
        onFocus={() => setOpen(true)}
        onBlur={() => { setPinned(false); setOpen(false); }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (pinned) { setPinned(false); setOpen(false); return; }
          setPinned(true);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setPinned(false); setOpen(false); }
        }}
        className={`absolute z-10 inline-flex items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-[10px] font-semibold leading-none text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${BADGE_POSITION_CLASSES[position]}`}
      >
        {label ?? 'ⓘ'}
        {open && (
          <span
            ref={panelRef}
            id={panelId}
            role="tooltip"
            style={panelStyle ?? {}}
            // Pointer events stay off while hovering (so the panel can't steal the
            // mouse) but come back once pinned, making its scrollbar usable.
            // `invisible` covers the single frame between mounting and the layout
            // effect measuring it — harmless now that a closed badge renders nothing.
            className={`${pinned ? '' : 'pointer-events-none'} absolute z-20 w-max break-words rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-normal normal-case text-slate-700 dark:text-slate-200 shadow-md max-w-[300px] max-h-[min(400px,95vh)] overflow-auto ${
              panelStyle ? '' : 'invisible'
            }`}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}
      </button>
      {children}
    </span>
  );
}
