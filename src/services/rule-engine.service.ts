import { pool } from '../db/postgres';
import type {
  RiskRule,
  RuleCondition,
  RuleEvaluationFacts,
  RuleEvaluationResult,
} from '../types/rule-engine';

const toComparableNumber = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const evaluateCondition = (facts: RuleEvaluationFacts, condition: RuleCondition): boolean => {
  const factValue = facts[condition.field as keyof RuleEvaluationFacts];

  switch (condition.operator) {
    case 'eq':
      return factValue === condition.value;
    case 'neq':
      return factValue !== condition.value;
    case 'gt': {
      const left = toComparableNumber(factValue);
      const right = toComparableNumber(condition.value);
      return left !== null && right !== null && left > right;
    }
    case 'gte': {
      const left = toComparableNumber(factValue);
      const right = toComparableNumber(condition.value);
      return left !== null && right !== null && left >= right;
    }
    case 'lt': {
      const left = toComparableNumber(factValue);
      const right = toComparableNumber(condition.value);
      return left !== null && right !== null && left < right;
    }
    case 'lte': {
      const left = toComparableNumber(factValue);
      const right = toComparableNumber(condition.value);
      return left !== null && right !== null && left <= right;
    }
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(factValue as never);
    default:
      return false;
  }
};

const matchesRule = (facts: RuleEvaluationFacts, conditions: RuleCondition[]): boolean => {
  return conditions.every((condition) => evaluateCondition(facts, condition));
};

const fetchActiveRules = async (organizationId: string): Promise<RiskRule[]> => {
  const result = await pool.query<{
    id: string;
    organization_id: string;
    name: string;
    is_active: boolean;
    priority: number;
    conditions: RuleCondition[];
    action_value: number;
  }>(
    `
      SELECT
        id,
        organization_id,
        name,
        is_active,
        priority,
        conditions,
        action_value
      FROM risk_rules
      WHERE organization_id = $1
        AND is_active = true
      ORDER BY priority ASC
    `,
    [organizationId],
  );

  return result.rows;
};

export const evaluateOrganizationRules = async (
  organizationId: string,
  facts: RuleEvaluationFacts,
  baseRisk = 0,
): Promise<RuleEvaluationResult> => {
  const rules = await fetchActiveRules(organizationId);
  let totalRisk = baseRisk;

  const triggeredRules: RuleEvaluationResult['triggered_rules'] = [];

  for (const rule of rules) {
    if (matchesRule(facts, rule.conditions)) {
      totalRisk += rule.action_value;
      triggeredRules.push({
        rule_id: rule.id,
        rule_name: rule.name,
        added_risk: rule.action_value,
      });
    }
  }

  return {
    organization_id: organizationId,
    base_risk: baseRisk,
    total_risk: Math.max(0, Math.min(100, totalRisk)),
    triggered_rules: triggeredRules,
  };
};
