import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STAGES } from '../lib/stages';
import type { StageIndex } from '../lib/stages';

type StageProgressProps = {
  stage: StageIndex;
  // Everything past the first stage needs a product to configure.
  unlocked: boolean;
  onGoToStage: (stage: StageIndex) => void;
};

// Orientation and backward navigation. It is a <nav>, not a progressbar: the
// items are destinations, not a measurement.
export function StageProgress({ stage, unlocked, onGoToStage }: StageProgressProps) {
  return (
    <nav aria-label="Etape" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5">
        {STAGES.map((s, index) => {
          const current = index === stage;
          const reachable = index === 0 || unlocked;
          return (
            <li key={s.title} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              )}
              <button
                onClick={() => onGoToStage(index as StageIndex)}
                disabled={!reachable}
                aria-current={current ? 'step' : undefined}
                aria-disabled={!reachable}
                aria-label={`Pasul ${index + 1} din ${STAGES.length}: ${s.title}`}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  current
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    current
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                {s.title}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type StageNavProps = {
  stage: StageIndex;
  unlocked: boolean;
  onGoToStage: (stage: StageIndex) => void;
};

// The single primary forward action, at the foot of the content where the user
// finishes reading — no duplicated sticky bar.
export function StageNav({ stage, unlocked, onGoToStage }: StageNavProps) {
  const next = STAGES[stage + 1];
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
      {stage > 0 ? (
        <button
          onClick={() => onGoToStage((stage - 1) as StageIndex)}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Înapoi
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button
          onClick={() => onGoToStage((stage + 1) as StageIndex)}
          disabled={!unlocked}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {`Continuă la ${next.title}`}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
