import { Evaluator } from './Evaluator';
import { RuleBasedEvaluator } from './RuleBasedEvaluator';
import { AIEvaluator } from './AIEvaluator';
import { HybridEvaluator } from './HybridEvaluator';

export type EvaluatorType = 'RuleBased' | 'AI' | 'Hybrid';

export class EvaluatorFactory {
  static getEvaluator(type: EvaluatorType | string): Evaluator {
    switch (type) {
      case 'RuleBased':
        return new RuleBasedEvaluator();
      case 'Hybrid':
        return new HybridEvaluator();
      case 'AI':
      default:
        return new AIEvaluator();
    }
  }
}
