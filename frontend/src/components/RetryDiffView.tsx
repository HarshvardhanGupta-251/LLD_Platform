import { Submission } from '../types';
import { GitCompare, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { CRITERION_TITLES } from './CriterionBadge';

interface RetryDiffViewProps {
  currentSubmission: Submission;
  previousSubmission?: Submission;
}

export const RetryDiffView: React.FC<RetryDiffViewProps> = ({
  currentSubmission,
  previousSubmission,
}) => {
  if (!previousSubmission) {
    return (
      <div className="glass-card rounded-xl p-4 border border-slate-800 text-xs text-slate-400 text-center">
        This is the first submission for this attempt. Submit a retry to unlock line-by-line diff comparison and score delta analytics.
      </div>
    );
  }

  const currentResult = currentSubmission.evaluation?.result;
  const previousResult = previousSubmission.evaluation?.result;

  const currentAvg = currentResult?.criterionScores.length
    ? currentResult.criterionScores.reduce((sum, cs) => sum + cs.score, 0) / currentResult.criterionScores.length
    : 0;

  const previousAvg = previousResult?.criterionScores.length
    ? previousResult.criterionScores.reduce((sum, cs) => sum + cs.score, 0) / previousResult.criterionScores.length
    : 0;

  const deltaAvg = parseFloat((currentAvg - previousAvg).toFixed(1));

  // Compute text diff line by line (simple addition/deletion split)
  const prevLines = previousSubmission.content.split('\n');
  const currLines = currentSubmission.content.split('\n');

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200">Retry Diff & Score Delta Inspector</h3>
        </div>

        {/* Score Delta Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Score Delta:</span>
          {deltaAvg > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              +{deltaAvg} pts (Improved!)
            </span>
          ) : deltaAvg < 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              {deltaAvg} pts
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1">
              <Minus className="w-3.5 h-3.5 text-slate-400" />
              No Change
            </span>
          )}
        </div>
      </div>

      {/* Criterion-by-Criterion Delta Table */}
      {currentResult && previousResult && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Per-Criterion Score Deltas</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentResult.criterionScores.map((currCs) => {
              const prevCs = previousResult.criterionScores.find((p) => p.criterion === currCs.criterion);
              const diff = prevCs ? currCs.score - prevCs.score : 0;
              const title = CRITERION_TITLES[currCs.criterion] || currCs.criterion;

              return (
                <div key={currCs.criterion} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="text-[11px] text-slate-400 truncate">{title}</div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">{prevCs?.score || '-'}&rarr;</span>
                    <span className="font-bold text-white">{currCs.score}/5</span>
                    <span className={`text-[10px] font-semibold px-1 rounded ${
                      diff > 0 ? 'bg-emerald-950 text-emerald-400' : diff < 0 ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Side-by-side / Diff Comparison View */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Text Changes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 overflow-x-auto max-h-60">
            <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-1 mb-2 font-sans font-semibold">
              Previous Submission ({new Date(previousSubmission.submittedAt).toLocaleTimeString()})
            </div>
            {prevLines.map((line, i) => (
              <div key={i} className="text-slate-400 whitespace-pre">
                {line}
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-indigo-900/60 space-y-1 overflow-x-auto max-h-60">
            <div className="text-[11px] text-indigo-300 border-b border-slate-800 pb-1 mb-2 font-sans font-semibold">
              Current Submission ({new Date(currentSubmission.submittedAt).toLocaleTimeString()})
            </div>
            {currLines.map((line, i) => (
              <div key={i} className="text-indigo-200 whitespace-pre">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
