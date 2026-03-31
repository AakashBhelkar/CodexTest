export type RuleOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';

export type RuleCondition = {
  field: string;
  operator: RuleOperator;
  value: string | number | boolean | Array<string | number | boolean>;
};

export type RiskRule = {
  id: string;
  organization_id: string;
  name: string;
  is_active: boolean;
  priority: number;
  conditions: RuleCondition[];
  action_value: number;
};

export type RuleEvaluationFacts = {
  return_count: number;
  payment_type: 'COD' | 'prepaid';
};

export type RuleEvaluationResult = {
  organization_id: string;
  base_risk: number;
  total_risk: number;
  triggered_rules: Array<{
    rule_id: string;
    rule_name: string;
    added_risk: number;
  }>;
};
