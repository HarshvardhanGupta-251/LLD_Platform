import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: number; // 0.0 - 1.0
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  const isLowConfidence = confidence < 0.6; // Low confidence threshold (< 0.6 / < 0.5)

  if (isLowConfidence) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/40 text-xs font-medium animate-pulse shadow-sm shadow-amber-500/10">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Worth a second look</span>
        <span className="font-mono text-[10px] bg-amber-900/80 px-1 rounded text-amber-200">
          {(confidence * 100).toFixed(0)}% confidence
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 text-[11px]">
      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
      <span>Confidence: {(confidence * 100).toFixed(0)}%</span>
    </div>
  );
};
