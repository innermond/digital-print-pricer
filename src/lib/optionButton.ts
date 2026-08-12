// The selected / disabled / neutral styling for the two option shapes used
// across the configurator. These strings were copy-pasted into eleven
// components; centralising them keeps a restyle to one file.
//
// Deliberately plain functions rather than components: the same classes are
// applied to <button>, <label> and Badge-wrapped nodes across several DOM
// shapes, so a wrapper component would force structural changes at every call
// site (and break the by-role queries the tests rely on).

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';

/** Compact toggle buttons: lamination, folding, printing, binding, units. */
export function optionButtonClass({ active, disabled = false }: { active: boolean; disabled?: boolean }) {
  const base = `rounded px-3 py-1.5 text-sm font-medium transition ${FOCUS}`;
  if (disabled) {
    return `${base} bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed`;
  }
  if (active) {
    return `${base} bg-blue-500 dark:bg-blue-600 text-white`;
  }
  return `${base} bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500`;
}

/** Larger bordered cards: media, sizes, products, categories. */
export function optionCardClass({ active }: { active: boolean }) {
  const base = `rounded-lg border-2 px-2.5 py-2 text-left transition ${FOCUS}`;
  return active
    ? `${base} border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950`
    : `${base} border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500`;
}
