import React from 'react';
import { Criterion } from '../types';

interface CriterionBadgeProps {
  criterion: Criterion | string;
  score: number;
  showScoreText?: boolean;
}

export const CRITERION_TITLES: Record<string, string> = {
  RequirementUnderstanding: 'Requirement Understanding',
  ResponsibilityAssignment: 'Responsibility Assignment',
  CouplingCohesion: 'Coupling & Cohesion',
  Encapsulation: 'Encapsulation',
  AbstractionUsage: 'Abstraction & Patterns',
  Extensibility: 'Extensibility (Open/Closed)',
  EdgeCaseHandling: 'Edge Case & Concurrency',
  ExplanationQuality: 'Explanation Quality',
};

export const CriterionBadge: React.FC<CriterionBadgeProps> = ({
  criterion,
  score,
  showScoreText = true,
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 4) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (val === 3) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  const getScoreBg = (val: number) => {
    if (val >= 4) return 'bg-emerald-500';
    if (val === 3) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const title = CRITERION_TITLES[criterion] || criterion;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${getScoreColor(
          score
        )}`}
      >
        <span className={`w-2 h-2 rounded-full ${getScoreBg(score)}`} />
        <span>{title}</span>
        {showScoreText && (
          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-900/60 ml-1">
            {score}/5
          </span>
        )}
      </div>
    </div>
  );
};
