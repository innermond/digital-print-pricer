import type { Paper } from '../../types';

type PaperSelectorProps = {
  papers: Paper[];
  selectedId: string;
  recommendedId: string;
  onSelect: (paper: Paper) => void;
};

export function PaperSelector({ papers, selectedId, recommendedId, onSelect }: PaperSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-900 dark:text-slate-50 mb-2">
        Paper
      </label>
      <div className="flex flex-wrap gap-2">
        {papers.map((paper) => (
          <button
            key={paper.id}
            onClick={() => onSelect(paper)}
            className={`flex-1 min-w-28 rounded-lg border-2 px-2.5 py-2 text-left transition text-xs relative ${
              selectedId === paper.id
                ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950'
                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
            }`}
          >
            {recommendedId === paper.id && (
              <span className="absolute top-1 right-1 bg-amber-500 text-white text-xs rounded px-1.5 py-0.5 font-medium">
                ⭐
              </span>
            )}
            <div className="font-medium text-slate-900 dark:text-slate-50">{paper.label}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{paper.gsm} GSM</div>
          </button>
        ))}
      </div>
    </div>
  );
}
