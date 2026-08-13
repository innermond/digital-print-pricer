import type { ChangeEvent } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';

const DEFAULT_POWER_TITLE = 'Calculator de prețuri ';
const DEFAULT_TAGLINE = 'Preț precis indiferent de specificul ofertei';

type AppHeaderProps = {
  // Host-supplied header markup, injected as raw HTML in place of the whole
  // default title + tagline block. When omitted (standalone dev), the built-in
  // title + tagline are shown. MUST be host-controlled/trusted — it is NOT
  // sanitized (dangerouslySetInnerHTML); never pass untrusted user input (XSS).
  powerText?: string;
  // Export/Import are admin tooling, hidden unless a host explicitly opts in.
  // Resetare stays available regardless.
  showExportImport?: boolean;
  onExport: () => void;
  onImport: (e: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
};

export function AppHeader({ powerText, showExportImport, onExport, onImport, onReset }: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-[21]">
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="flex items-center justify-between gap-4">
          {powerText ? (
            <div className="min-w-0" dangerouslySetInnerHTML={{ __html: powerText }} />
          ) : (
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 truncate">
                {DEFAULT_POWER_TITLE}
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {DEFAULT_TAGLINE}
              </p>
            </div>
          )}
          <div className="flex gap-2 flex-shrink-0">
            {showExportImport && (
              <>
                <button
                  onClick={onExport}
                  className="flex items-center gap-1 sm:gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 transition hover:bg-blue-100 dark:hover:bg-blue-900"
                  title="Exportați configurația ca JSON"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <label className="flex cursor-pointer items-center gap-1 sm:gap-2 rounded-lg bg-green-50 dark:bg-green-950 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 transition hover:bg-green-100 dark:hover:bg-green-900">
                  <Upload size={16} />
                  <span className="hidden sm:inline">Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImport}
                    className="hidden"
                  />
                </label>
              </>
            )}
            <button
              onClick={onReset}
              className="flex items-center gap-1 sm:gap-2 rounded-lg bg-amber-50 dark:bg-amber-950 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 transition hover:bg-amber-100 dark:hover:bg-amber-900"
              title="Resetare la valorile implicite"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Resetare</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
