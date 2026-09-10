import React, { useState } from 'react';
import { Send, Sparkles, RefreshCw, Key, FileCode, CheckCircle, ShieldAlert } from 'lucide-react';

interface SolutionEditorProps {
  problemTitle: string;
  problemDescription: string;
  onSubmitSolution: (content: string, idempotencyKey: string, evaluatorType: 'AI' | 'RuleBased' | 'Hybrid') => Promise<void>;
  isSubmitting: boolean;
}

export const SolutionEditor: React.FC<SolutionEditorProps> = ({
  problemTitle,
  problemDescription,
  onSubmitSolution,
  isSubmitting,
}) => {
  const [content, setContent] = useState<string>('');
  const [evaluatorType, setEvaluatorType] = useState<'AI' | 'RuleBased' | 'Hybrid'>('AI');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(`key-${Date.now()}`);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const isSanityValid = charCount >= 30;

  const handleGenerateKey = () => {
    setIdempotencyKey(`key-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  };

  const handleInsertTemplate = () => {
    const template = `### 1. REQUIREMENT ASSUMPTIONS & BOUNDARIES
- Functional Scope: Primary entities, access patterns, and core workflows.
- Operational Constraints: Latency expectations, scale bounds, and concurrency assumptions.

### 2. CORE CLASS HIERARCHY & ENTITY MODELS
\`\`\`
class SystemController {
  private memoryCache: Map<string, Entity>;
  private strategy: ProcessingStrategy;

  public processRequest(request: SystemRequest): Response {
    // Single Responsibility: Delegates strategy execution
    return this.strategy.execute(request);
  }
}

interface ProcessingStrategy {
  execute(request: SystemRequest): Response;
}

class ConcreteStrategyA implements ProcessingStrategy {
  public execute(request: SystemRequest): Response {
    // Specific algorithm logic
    return new Response("Success");
  }
}
\`\`\`

### 3. DESIGN PATTERNS & ARCHITECTURAL DECISIONS
- Strategy Pattern: Applied for dynamic algorithm selection.
- Encapsulation: Internal collections are kept private and accessible only via domain methods.
- Loose Coupling: Depend on interface abstractions rather than concrete classes.

### 4. EDGE CASE & CONCURRENCY STRATEGY
- Concurrency Control: Synchronized blocks or optimistic locks to prevent race conditions.
- Failure Recovery: Transactional rollbacks and explicit exception handling.
`;
    setContent(template);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!content.trim()) {
      setErrorMsg('Submission text cannot be empty.');
      return;
    }

    if (!isSanityValid) {
      setErrorMsg('Submission text is too short (< 30 chars). Please write a meaningful LLD design.');
      return;
    }

    try {
      await onSubmitSolution(content, idempotencyKey, evaluatorType);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit solution.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">LLD Solution Workspace</h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleInsertTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-xs font-medium hover:bg-indigo-900/60 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Insert Starter Template
          </button>
        </div>
      </div>

      {/* Editor Main Text Area */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your LLD solution text here. Include class models, responsibility assignments, design patterns (Strategy, State, Factory), and concurrency strategies..."
          className="w-full h-80 bg-slate-950 text-slate-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y leading-relaxed"
        />

        <div className="absolute bottom-3 right-3 flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800">
          <span>Words: {wordCount}</span>
          <span>Chars: {charCount}</span>
          <span className={isSanityValid ? 'text-emerald-400' : 'text-amber-400'}>
            {isSanityValid ? 'Sanity: Valid' : 'Min 30 chars required'}
          </span>
        </div>
      </div>

      {/* Configuration & Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
        {/* Evaluator Selector */}
        <div className="space-y-1.5">
          <label className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Polymorphic Evaluator Mode:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['AI', 'Hybrid', 'RuleBased'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEvaluatorType(type)}
                className={`py-1.5 px-2 rounded-lg border font-medium text-[11px] transition-all ${
                  evaluatorType === type
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {type === 'AI' ? '🤖 AI Evaluator' : type === 'Hybrid' ? '⚡ Hybrid Gate' : 'Rule-Based'}
              </button>
            ))}
          </div>
        </div>

        {/* Idempotency Key Control */}
        <div className="space-y-1.5">
          <label className="text-slate-300 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              Idempotency Key:
            </span>
            <button
              type="button"
              onClick={handleGenerateKey}
              className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
          </label>
          <input
            type="text"
            value={idempotencyKey}
            onChange={(e) => setIdempotencyKey(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] px-3 py-1.5 rounded-lg outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !isSanityValid}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Submitting & Triggering Async Evaluation...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Solution for Evaluation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
