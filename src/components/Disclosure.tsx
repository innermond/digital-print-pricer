import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

type DisclosureProps = {
  label: string;
  children: ReactNode;
  // Settings that diverge from the default. When the section is collapsed these
  // are shown inline, so folding it away never hides a choice the user made.
  chips?: string[];
  // Re-evaluate the open state when this changes (e.g. the selected elemental),
  // so switching to a tab with non-default settings reveals them.
  resetKey?: string;
  // Bumped by the parent to force this section open (e.g. the "Personalizat"
  // button jumping to the custom-size fields) even if the user had collapsed it.
  openSignal?: number;
};

// A plain button + conditional render rather than <details>/<summary>: jsdom's
// toggle-event support is inconsistent and the a11y behaviour shouldn't depend
// on it.
export function Disclosure({ label, children, chips = [], resetKey, openSignal }: DisclosureProps) {
  const panelId = useId();
  const dirty = chips.length > 0;
  const [open, setOpen] = useState(dirty);

  // Re-evaluate the open state when the context switches (a different elemental
  // tab), but not on every chip change — that would fight the user closing a
  // section they just edited. Adjusting during render rather than in an effect
  // avoids rendering the stale state for a frame first.
  const [prevKey, setPrevKey] = useState(resetKey);
  if (resetKey !== prevKey) {
    setPrevKey(resetKey);
    setOpen(dirty);
  }

  const [prevOpenSignal, setPrevOpenSignal] = useState(openSignal);
  if (openSignal !== prevOpenSignal) {
    setPrevOpenSignal(openSignal);
    setOpen(true);
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
      >
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-slate-500 transition-transform ${open ? '' : '-rotate-90'}`}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{label}</span>
        {!open && dirty && (
          <span className="flex flex-wrap gap-1 min-w-0">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-900 dark:text-blue-100"
              >
                {chip}
              </span>
            ))}
          </span>
        )}
      </button>
      {open && (
        <div id={panelId} className="px-3 pb-3 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}
