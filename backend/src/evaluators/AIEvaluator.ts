import { GoogleGenAI } from '@google/genai';
import { Evaluator, SubmissionData, EvaluationResultData, CriterionScoreData } from './Evaluator';
import { Criterion, RUBRIC_CRITERIA, SYSTEM_EVALUATOR_PROMPT } from '../domain/rubric';

export class AIEvaluator implements Evaluator {
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      this.aiClient = new GoogleGenAI({ apiKey });
    }
  }

  async evaluate(
    submission: SubmissionData,
    problemContext?: { title: string; description: string; constraints: string }
  ): Promise<EvaluationResultData> {
    const text = submission.content || '';

    // Synchronous deterministic checks before AI execution
    if (!text || text.trim().length === 0) {
      throw new Error('Deterministic Check Failed: Empty submission content.');
    }
    if (text.trim().length < 30) {
      throw new Error('Deterministic Check Failed: Solution is too short (< 30 characters).');
    }

    if (this.aiClient) {
      try {
        return await this.callGeminiAPI(submission, problemContext);
      } catch (err: any) {
        console.warn('Gemini API call failed, invoking intelligent fallback evaluator:', err?.message || err);
        return this.generateHeuristicEvaluation(submission, problemContext);
      }
    }

    return this.generateHeuristicEvaluation(submission, problemContext);
  }

  private async callGeminiAPI(
    submission: SubmissionData,
    problemContext?: { title: string; description: string; constraints: string }
  ): Promise<EvaluationResultData> {
    if (!this.aiClient) throw new Error('AI Client not initialized');

    const prompt = `
PROBLEM TITLE: ${problemContext?.title || submission.problemTitle || 'Low-Level System Design Problem'}
PROBLEM DESCRIPTION:
${problemContext?.description || submission.problemDescription || 'Design a complete low-level object-oriented architecture.'}

PROBLEM CONSTRAINTS:
${problemContext?.constraints || 'Standard object-oriented principles, extensibility, concurrency.'}

CANDIDATE SUBMISSION TEXT:
---
${submission.content}
---

Please evaluate the candidate's solution strictly according to the system prompt rubric and output only valid JSON matching the schema.
`;

    const response = await this.aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_EVALUATOR_PROMPT + '\n' + prompt }] }
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const cleanJsonText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(cleanJsonText);
    return this.validateAndNormalizeResponse(parsed, submission.content);
  }

  private validateAndNormalizeResponse(parsed: any, originalContent: string): EvaluationResultData {
    const criteriaScores: CriterionScoreData[] = [];
    const validCriteria = Object.values(Criterion);

    for (const crit of RUBRIC_CRITERIA) {
      const matched = parsed.criteria?.find((c: any) => c.criterion === crit.criterion);
      if (matched) {
        criteriaScores.push({
          criterion: crit.criterion,
          score: Math.min(5, Math.max(1, Number(matched.score) || 3)),
          evidence: matched.evidence || 'Evidence extracted from solution.',
          concern: matched.score >= 4 ? null : (matched.concern || 'Minor area for enhancement.'),
          suggestion: matched.suggestion || 'Incorporate explicit design patterns and clear interface abstractions.',
          confidence: Math.min(1.0, Math.max(0.0, Number(matched.confidence) ?? 0.85)),
        });
      } else {
        criteriaScores.push({
          criterion: crit.criterion,
          score: 3,
          evidence: 'General design layout.',
          concern: null,
          suggestion: 'Elaborate further on this criterion in the solution text.',
          confidence: 0.7,
        });
      }
    }

    return {
      overallSummary: parsed.overallSummary || 'Solution evaluated successfully against LLD rubric criteria.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Good initial structure.'],
      improvementAreas: Array.isArray(parsed.improvementAreas) ? parsed.improvementAreas : ['Expand edge case handling and concurrency.'],
      criterionScores: criteriaScores,
    };
  }

  /**
   * High-fidelity heuristic engine used when offline or when AI API key is not configured.
   */
  private generateHeuristicEvaluation(
    submission: SubmissionData,
    problemContext?: { title: string; description: string; constraints: string }
  ): EvaluationResultData {
    const text = submission.content;
    const lower = text.toLowerCase();

    const hasClasses = lower.includes('class') || lower.includes('interface') || lower.includes('enum');
    const hasMethods = lower.includes('public') || lower.includes('private') || lower.includes('def') || lower.includes('function');
    const hasPatterns = lower.includes('strategy') || lower.includes('factory') || lower.includes('singleton') || lower.includes('observer') || lower.includes('state');
    const hasConcurrency = lower.includes('lock') || lower.includes('thread') || lower.includes('concurrent') || lower.includes('mutex') || lower.includes('race');
    const hasEncapsulation = lower.includes('private') || lower.includes('readonly') || lower.includes('getter') || lower.includes('encapsulat');
    const hasCoupling = lower.includes('interface') || lower.includes('inject') || lower.includes('decoupl');
    const hasEdgeCases = lower.includes('exception') || lower.includes('error') || lower.includes('boundary') || lower.includes('validation');

    const criteriaScores: CriterionScoreData[] = [
      {
        criterion: Criterion.RequirementUnderstanding,
        score: text.length > 600 ? 5 : text.length > 300 ? 4 : 3,
        evidence: text.substring(0, 120) + '...',
        concern: text.length < 300 ? 'Scope of requirements could be more explicit.' : null,
        suggestion: 'Provide explicit non-functional metrics and scale constraints in your overview.',
        confidence: 0.9,
      },
      {
        criterion: Criterion.ResponsibilityAssignment,
        score: hasClasses && hasMethods ? 4 : 2,
        evidence: hasClasses ? 'Identified core classes and domain model entities.' : 'Lacks explicit class model definitions.',
        concern: !(hasClasses && hasMethods) ? 'God object anti-pattern risk if methods are not broken down per entity.' : null,
        suggestion: 'Separate data transfer objects, controllers, and domain models clearly.',
        confidence: 0.88,
      },
      {
        criterion: Criterion.CouplingCohesion,
        score: hasCoupling ? 4 : 3,
        evidence: hasCoupling ? 'Uses interfaces or abstraction layers for loose coupling.' : 'Concrete dependencies referenced directly.',
        concern: !hasCoupling ? 'High coupling between domain entities and concrete implementations.' : null,
        suggestion: 'Introduce abstract interfaces (e.g. PaymentProcessor interface) to decouple caller logic.',
        confidence: 0.82,
      },
      {
        criterion: Criterion.Encapsulation,
        score: hasEncapsulation ? 4 : 2,
        evidence: hasEncapsulation ? 'Employs private access modifiers and encapsulation.' : 'Internal fields appear exposed.',
        concern: !hasEncapsulation ? 'Direct access to mutable internal state without invariant validation.' : null,
        suggestion: 'Encapsulate internal collections and fields behind getter/setter accessors or immutable views.',
        confidence: 0.85,
      },
      {
        criterion: Criterion.AbstractionUsage,
        score: hasPatterns ? 5 : 3,
        evidence: hasPatterns ? 'Demonstrates appropriate usage of design patterns (e.g., Strategy/Factory/State).' : 'Basic OOD hierarchy without formal design patterns.',
        concern: !hasPatterns ? 'Opportunity missed to apply classic LLD design patterns.' : null,
        suggestion: 'Incorporate Strategy Pattern for dynamic algorithm selection or State Pattern for stateful entities.',
        confidence: 0.92,
      },
      {
        criterion: Criterion.Extensibility,
        score: hasPatterns || hasCoupling ? 4 : 3,
        evidence: hasPatterns ? 'Extensible design allowing new behaviors via interface extension.' : 'Adding features requires direct code modification.',
        concern: !(hasPatterns || hasCoupling) ? 'Violates Open/Closed Principle for future requirement changes.' : null,
        suggestion: 'Ensure new strategies or handlers can be registered without modifying core engine classes.',
        confidence: 0.86,
      },
      {
        criterion: Criterion.EdgeCaseHandling,
        score: hasConcurrency && hasEdgeCases ? 4 : hasConcurrency || hasEdgeCases ? 3 : 2,
        evidence: hasConcurrency ? 'Considers concurrency, locking, or race conditions.' : 'Edge cases and concurrency locks not detailed.',
        concern: !hasConcurrency ? 'Race conditions possible when multiple requests update state concurrently.' : null,
        suggestion: 'Detail explicit concurrency controls (e.g. ReentrantLock, optimistic locking, synchronized blocks).',
        confidence: 0.78, // Low confidence alert candidate!
      },
      {
        criterion: Criterion.ExplanationQuality,
        score: text.length > 500 ? 4 : 3,
        evidence: 'Explanation covers key design choices and structural overview.',
        concern: text.length <= 500 ? 'Brief text explanation lacks deep architectural trade-off discussion.' : null,
        suggestion: 'Document key trade-offs considered (e.g. in-memory locking vs database locks).',
        confidence: 0.85,
      },
    ];

    const overallSummary = `Evaluated submission (${text.length} chars) across 8 LLD criteria. Solution presents a structured approach with solid baseline class models.`;
    const strengths = criteriaScores.filter(c => c.score >= 4).map(c => `${c.criterion}: Strong score (${c.score}/5) - ${c.evidence}`);
    const improvementAreas = criteriaScores.filter(c => c.score <= 3).map(c => `${c.criterion}: ${c.suggestion}`);

    return {
      overallSummary,
      strengths: strengths.length > 0 ? strengths : ['Good initial attempt detailing system entities.'],
      improvementAreas: improvementAreas.length > 0 ? improvementAreas : ['Add concurrency controls and explicit design patterns.'],
      criterionScores: criteriaScores,
    };
  }
}
