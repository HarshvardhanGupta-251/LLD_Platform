export enum Criterion {
  RequirementUnderstanding = 'RequirementUnderstanding',
  ResponsibilityAssignment = 'ResponsibilityAssignment',
  CouplingCohesion = 'CouplingCohesion',
  Encapsulation = 'Encapsulation',
  AbstractionUsage = 'AbstractionUsage',
  Extensibility = 'Extensibility',
  EdgeCaseHandling = 'EdgeCaseHandling',
  ExplanationQuality = 'ExplanationQuality',
}

export interface CriterionRubric {
  criterion: Criterion;
  title: string;
  description: string;
  anchor1: string; // What score 1 looks like
  anchor3: string; // What score 3 looks like
  anchor5: string; // What score 5 looks like
}

export const RUBRIC_CRITERIA: CriterionRubric[] = [
  {
    criterion: Criterion.RequirementUnderstanding,
    title: 'Requirement Understanding',
    description: 'Accurately captures core functional and non-functional requirements in the design.',
    anchor1: 'Misses core requirements, invents irrelevant features, or fundamentally misunderstands the problem goals.',
    anchor3: 'Covers main happy-path requirements but misses key operational constraints or concurrency considerations.',
    anchor5: 'Comprehensive coverage of functional and non-functional requirements, explicit bounds, and clear constraints.',
  },
  {
    criterion: Criterion.ResponsibilityAssignment,
    title: 'Responsibility Assignment',
    description: 'Applies Single Responsibility Principle (SRP); classes/modules have clear, cohesive roles.',
    anchor1: 'God objects handling DB, UI, business logic, and state simultaneously.',
    anchor3: 'Reasonable class breakdown, but some methods cross domain boundaries or hold excessive responsibilities.',
    anchor5: 'Clean SRP enforcement with single focused responsibility per entity, well-bounded context.',
  },
  {
    criterion: Criterion.CouplingCohesion,
    title: 'Coupling & Cohesion',
    description: 'High cohesion within modules, low coupling between distinct components.',
    anchor1: 'Tightly coupled monolithic design; changing one class requires cascading updates across all classes.',
    anchor3: 'Moderate coupling; some direct class references where interfaces or dependency injection should be used.',
    anchor5: 'Loose coupling via interfaces and dependency injection; high cohesion within domain models.',
  },
  {
    criterion: Criterion.Encapsulation,
    title: 'Encapsulation',
    description: 'Hides internal implementation details; exposes minimal clean public APIs.',
    anchor1: 'Exposes mutable public fields everywhere; external components mutate internal state directly.',
    anchor3: 'Uses private fields, but provides indiscriminate getters/setters exposing raw internals.',
    anchor5: 'Strict encapsulation; state mutated only via rich domain methods with invariant validation.',
  },
  {
    criterion: Criterion.AbstractionUsage,
    title: 'Abstraction & Design Patterns',
    description: 'Applies appropriate abstractions and recognized LLD design patterns (Strategy, State, Factory, Observer, etc.).',
    anchor1: 'No abstractions; excessive if-else or switch statements replacing polymorphic behaviors.',
    anchor3: 'Basic interface usage; attempts pattern application but over-engineers or slightly misapplies pattern semantics.',
    anchor5: 'Judicious design pattern selection (e.g. Strategy for payment, State for lifecycle) cleanly separating concerns.',
  },
  {
    criterion: Criterion.Extensibility,
    title: 'Extensibility (Open/Closed Principle)',
    description: 'System is open for extension but closed for modification when requirements evolve.',
    anchor1: 'Rigid structure; adding a new feature requires modifying existing core execution paths.',
    anchor3: 'Partially extensible; plugin points exist for some modules but hardcoded elsewhere.',
    anchor5: 'Highly extensible; new behaviors added seamlessly via interface implementations without touching existing code.',
  },
  {
    criterion: Criterion.EdgeCaseHandling,
    title: 'Edge Case & Concurrency Handling',
    description: 'Addresses boundary conditions, race conditions, error recovery, and failure modes.',
    anchor1: 'Ignores errors, concurrency, race conditions, and invalid inputs completely.',
    anchor3: 'Mentions basic try-catch or validation, but lacks explicit locks/atomic operations for concurrent scenarios.',
    anchor5: 'Robust error handling, explicit thread-safety / concurrency locks, transaction boundaries, and graceful degradation.',
  },
  {
    criterion: Criterion.ExplanationQuality,
    title: 'Explanation & Trade-off Quality',
    description: 'Communicates architectural choices, class relationships, and design trade-offs clearly.',
    anchor1: 'Sparse or incomprehensible submission text; no rationale provided for key decisions.',
    anchor3: 'Describes what classes exist, but lacks deep reasoning on why specific patterns or trade-offs were made.',
    anchor5: 'Crystal-clear structure, detailed design rationales, explicit trade-off analysis, and class relationship flow.',
  },
];

export const SYSTEM_EVALUATOR_PROMPT = `
You are an expert Senior Software Architect evaluating Low-Level Design (LLD) solutions submitted by candidates or learners.

EVALUATION RUBRIC ANCHORS:
${RUBRIC_CRITERIA.map(
  (c) => `
[${c.criterion}] - ${c.title}
Description: ${c.description}
Score 1 Anchor: ${c.anchor1}
Score 3 Anchor: ${c.anchor3}
Score 5 Anchor: ${c.anchor5}
`
).join('\n')}

EVALUATION RULES:
1. Grade strictly based on evidence provided in the user's submission text.
2. For EACH of the 8 criteria, assign a score (1 to 5), quote/paraphrase specific evidence from the submission, highlight concerns (or null if score is high), provide an actionable suggestion for improvement, and output a confidence rating between 0.0 and 1.0.
3. Provide an overall summary (2-3 sentences), list top strengths, and top improvement areas.
4. Output MUST BE strictly VALID JSON matching the required schema. Never include markdown wrappers like \`\`\`json outside the JSON output if raw response is requested, but if generated, ensure top-level object is valid JSON.

JSON RESPONSE SCHEMA:
{
  "criteria": [
    {
      "criterion": "RequirementUnderstanding | ResponsibilityAssignment | CouplingCohesion | Encapsulation | AbstractionUsage | Extensibility | EdgeCaseHandling | ExplanationQuality",
      "score": 1-5,
      "evidence": "exact quote or specific paraphrase from submission text",
      "concern": "description of flaw or null if score >= 4",
      "suggestion": "actionable feedback on how to achieve a higher score",
      "confidence": 0.0-1.0
    }
  ],
  "overallSummary": "2-3 sentences summarizing the submission quality.",
  "strengths": ["strength 1", "strength 2"],
  "improvementAreas": ["improvement 1", "improvement 2"]
}
`;
