import { Evaluator, SubmissionData, EvaluationResultData, CriterionScoreData } from './Evaluator';
import { RuleBasedEvaluator } from './RuleBasedEvaluator';
import { AIEvaluator } from './AIEvaluator';

export class HybridEvaluator implements Evaluator {
  private ruleEvaluator: RuleBasedEvaluator;
  private aiEvaluator: AIEvaluator;

  constructor() {
    this.ruleEvaluator = new RuleBasedEvaluator();
    this.aiEvaluator = new AIEvaluator();
  }

  async evaluate(
    submission: SubmissionData,
    problemContext?: { title: string; description: string; constraints: string }
  ): Promise<EvaluationResultData> {
    // GATE 1: Deterministic Rule-Based checks run first (fail-fast gate)
    const ruleResult = await this.ruleEvaluator.evaluate(submission, problemContext);

    // GATE 2: AI Evaluation runs only after rule-based gate succeeds
    const aiResult = await this.aiEvaluator.evaluate(submission, problemContext);

    // Merge rule-based and AI criterion scores
    const mergedScores: CriterionScoreData[] = ruleResult.criterionScores.map((ruleScore) => {
      const aiScore = aiResult.criterionScores.find((a) => a.criterion === ruleScore.criterion);
      if (!aiScore) return ruleScore;

      // Weighted average: 30% Rule-Based structure, 70% AI qualitative depth
      const finalScore = Math.round(ruleScore.score * 0.3 + aiScore.score * 0.7);
      const combinedConfidence = parseFloat(((ruleScore.confidence + aiScore.confidence) / 2).toFixed(2));

      return {
        criterion: ruleScore.criterion,
        score: Math.min(5, Math.max(1, finalScore)),
        evidence: aiScore.evidence || ruleScore.evidence,
        concern: finalScore < 4 ? (aiScore.concern || ruleScore.concern || 'Needs further refinement.') : null,
        suggestion: aiScore.suggestion || ruleScore.suggestion,
        confidence: combinedConfidence,
      };
    });

    const mergedStrengths = Array.from(new Set([...ruleResult.strengths, ...aiResult.strengths]));
    const mergedImprovements = Array.from(new Set([...ruleResult.improvementAreas, ...aiResult.improvementAreas]));

    return {
      overallSummary: `[Hybrid Evaluation] ${aiResult.overallSummary}`,
      strengths: mergedStrengths,
      improvementAreas: mergedImprovements,
      criterionScores: mergedScores,
    };
  }
}
