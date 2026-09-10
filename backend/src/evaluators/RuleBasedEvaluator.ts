import { Evaluator, SubmissionData, EvaluationResultData, CriterionScoreData } from './Evaluator';
import { Criterion, RUBRIC_CRITERIA } from '../domain/rubric';

export class RuleBasedEvaluator implements Evaluator {
  async evaluate(
    submission: SubmissionData,
    problemContext?: { title: string; description: string; constraints: string }
  ): Promise<EvaluationResultData> {
    const text = submission.content || '';
    const lowerText = text.toLowerCase();

    // Deterministic validation checks
    if (!text || text.trim().length === 0) {
      throw new Error('Deterministic Check Failed: Submission content is empty.');
    }

    if (text.trim().length < 30) {
      throw new Error('Deterministic Check Failed: Submission text is too short (< 30 characters) for a valid LLD solution.');
    }

    // Keyword detection features
    const hasClasses = /\b(class|interface|enum|type|struct|component|entity)\b/i.test(text);
    const hasMethods = /\b(method|function|public|private|protected|void|async|returns?|\(\))\b/i.test(text);
    const hasPatterns = /\b(strategy|factory|singleton|observer|state|adapter|decorator|facade|builder)\b/i.test(text);
    const hasConcurrency = /\b(lock|thread|concurrent|atomic|mutex|sync|semaphore|race|queue)\b/i.test(text);
    const hasRequirements = /\b(requirement|use case|functional|non-functional|scope|constraint|scale)\b/i.test(text);
    const hasEncapsulation = /\b(private|protected|getter|setter|encapsulat|immutable|accessor)\b/i.test(text);
    const hasCoupling = /\b(decoupl|inject|dependency|interface|loose coupling|cohesion)\b/i.test(text);
    const hasExplanation = /\b(because|rationale|trade-off|tradeoff|decision|design choice|approach)\b/i.test(text);

    const scores: CriterionScoreData[] = [];

    // 1. Requirement Understanding
    const reqScore = hasRequirements ? (text.length > 500 ? 4 : 3) : 2;
    scores.push({
      criterion: Criterion.RequirementUnderstanding,
      score: reqScore,
      evidence: hasRequirements ? 'Explicitly mentions requirements or use cases in text.' : 'Limited explicit mention of requirements scope.',
      concern: reqScore < 3 ? 'Sparse definition of functional and non-functional requirements.' : null,
      suggestion: 'Structure a dedicated "Requirements & Use Cases" section with core functional and edge-case assumptions.',
      confidence: 0.95,
    });

    // 2. Responsibility Assignment
    const respScore = hasClasses && hasMethods ? 4 : (hasClasses ? 3 : 1);
    scores.push({
      criterion: Criterion.ResponsibilityAssignment,
      score: respScore,
      evidence: hasClasses ? 'Identified core classes and domain model entities.' : 'Missing class declarations or responsibility breakdown.',
      concern: respScore < 3 ? 'Lacks explicit class and component declarations.' : null,
      suggestion: 'Define distinct classes/interfaces with single, well-defined responsibilities (SRP).',
      confidence: 0.9,
    });

    // 3. Coupling & Cohesion
    const couplingScore = hasCoupling ? 4 : (hasClasses ? 3 : 2);
    scores.push({
      criterion: Criterion.CouplingCohesion,
      score: couplingScore,
      evidence: hasCoupling ? 'Mentions dependency injection, interfaces, or loose coupling.' : 'Basic component structure detected.',
      concern: couplingScore < 3 ? 'Potential tight coupling between components.' : null,
      suggestion: 'Use interface abstractions and dependency injection to decouple caller from concrete implementations.',
      confidence: 0.85,
    });

    // 4. Encapsulation
    const encapScore = hasEncapsulation ? 4 : 2;
    scores.push({
      criterion: Criterion.Encapsulation,
      score: encapScore,
      evidence: hasEncapsulation ? 'Uses visibility modifiers or immutability descriptors.' : 'Internal access modifiers not explicitly specified.',
      concern: encapScore < 3 ? 'Fields and internal state mutability are not strictly guarded.' : null,
      suggestion: 'Mark internal state fields as private/readonly and expose mutation only through domain methods.',
      confidence: 0.85,
    });

    // 5. Abstraction Usage
    const patternScore = hasPatterns ? 5 : (hasClasses ? 3 : 1);
    scores.push({
      criterion: Criterion.AbstractionUsage,
      score: patternScore,
      evidence: hasPatterns ? 'Explicitly incorporates software design patterns.' : 'Standard class hierarchy without explicit design patterns.',
      concern: patternScore < 3 ? 'No design patterns (e.g. Strategy, State, Factory) utilized.' : null,
      suggestion: 'Identify variable behaviors (e.g., pricing strategies, state transitions) and apply matching design patterns.',
      confidence: 0.9,
    });

    // 6. Extensibility
    const extScore = hasPatterns || hasCoupling ? 4 : 2;
    scores.push({
      criterion: Criterion.Extensibility,
      score: extScore,
      evidence: hasPatterns || hasCoupling ? 'Abstract interfaces enable extending functionality without core modification.' : 'Rigid design layout.',
      concern: extScore < 3 ? 'Adding new types or strategies requires editing core execution code.' : null,
      suggestion: 'Ensure open-closed principle by introducing extensible interfaces for future features.',
      confidence: 0.85,
    });

    // 7. Edge Case Handling
    const edgeScore = hasConcurrency ? 4 : 2;
    scores.push({
      criterion: Criterion.EdgeCaseHandling,
      score: edgeScore,
      evidence: hasConcurrency ? 'Considers concurrency, locking, or race conditions.' : 'Concurrency and failure edge cases omitted.',
      concern: edgeScore < 3 ? 'Missing concurrency control or race condition mitigation.' : null,
      suggestion: 'Address concurrent requests, locking mechanisms, and error recovery strategies.',
      confidence: 0.9,
    });

    // 8. Explanation Quality
    const expScore = hasExplanation ? 4 : (text.length > 300 ? 3 : 2);
    scores.push({
      criterion: Criterion.ExplanationQuality,
      score: expScore,
      evidence: hasExplanation ? 'Includes architectural rationale and design decisions.' : 'Brief text description without deep trade-off reasoning.',
      concern: expScore < 3 ? 'Lacks explanation of design choices and trade-offs.' : null,
      suggestion: 'Add design decision rationales explaining why specific data structures or patterns were selected.',
      confidence: 0.9,
    });

    const avgScore = (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1);
    const strengths = scores.filter((s) => s.score >= 4).map((s) => `${s.criterion}: ${s.evidence}`);
    const improvementAreas = scores.filter((s) => s.score <= 2).map((s) => `${s.criterion}: ${s.suggestion}`);

    return {
      overallSummary: `Rule-based structural check evaluated submission (${text.length} characters) with average score ${avgScore}/5. Deterministic keyword and structure analysis completed successfully.`,
      strengths: strengths.length > 0 ? strengths : ['Contains baseline text structure.'],
      improvementAreas: improvementAreas.length > 0 ? improvementAreas : ['Consider elaborating design pattern choices and concurrency locks.'],
      criterionScores: scores,
    };
  }
}
