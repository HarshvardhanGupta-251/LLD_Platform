import React, { useState } from 'react';
import { CriterionScore } from '../types';
import { Search, Highlighter, Eye } from 'lucide-react';
import { CRITERION_TITLES } from './CriterionBadge';

interface EvidenceHighlighterProps {
  submissionText: string;
  criterionScores: CriterionScore[];
}

export const EvidenceHighlighter: React.FC<EvidenceHighlighterProps> = ({
  submissionText,
  criterionScores,
}) => {
  const [activeCriterion, setActiveCriterion] = useState<string | null>(null);

  // Find evidence phrase for active criterion
  const activeScore = criterionScores.find((cs) => cs.criterion === activeCriterion);
  const evidenceText = activeScore?.evidence || '';

  const renderHighlightedText = () => {
    if (!activeCriterion || !evidenceText || evidenceText.length < 5) {
      return (
        <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80 leading-relaxed overflow-x-auto">
          {submissionText}
        </pre>
      );
    }

    // Try finding exact match or key substring
    const cleanEvidence = evidenceText.replace(/\.\.\.$/, '').trim();
    const index = submissionText.toLowerCase().indexOf(cleanEvidence.toLowerCase());

    if (index === -1) {
      // Fallback: render text with banner showing evidence text
      return (
        <div className="space-y-3">
          <div className="p-3 bg-indigo-950/60 border border-indigo-500/40 rounded-lg text-xs text-indigo-200">
            <strong>Cited Evidence Snippet:</strong> &quot;{evidenceText}&quot;
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80 leading-relaxed overflow-x-auto">
            {submissionText}
          </pre>
        </div>
      );
    }

    const before = submissionText.substring(0, index);
    const match = submissionText.substring(index, index + cleanEvidence.length);
    const after = submissionText.substring(index + cleanEvidence.length);

    return (
      <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80 leading-relaxed overflow-x-auto">
        {before}
        <mark className="bg-amber-400/30 text-amber-200 px-1 py-0.5 rounded border border-amber-400/50 shadow-sm font-semibold">
          {match}
        </mark>
        {after}
      </pre>
    );
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Submission Evidence Inspector</h3>
        </div>
        <div className="text-xs text-slate-400">
          Click a criterion tag below to highlight cited evidence in submission
        </div>
      </div>

      {/* Criterion Selector Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCriterion(null)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            activeCriterion === null
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Plain Text View
        </button>

        {criterionScores.map((cs) => {
          const title = CRITERION_TITLES[cs.criterion] || cs.criterion;
          const isActive = activeCriterion === cs.criterion;
          return (
            <button
              key={cs.id || cs.criterion}
              onClick={() => setActiveCriterion(isActive ? null : cs.criterion)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{title}</span>
            </button>
          );
        })}
      </div>

      {/* Rendered Text Box */}
      {renderHighlightedText()}
    </div>
  );
};
