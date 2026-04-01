export type RiskDecision = 'approve' | 'review' | 'reject';

export type RiskScoringInput = {
  returnCountLast90Days: number;
  paymentType: 'COD' | 'prepaid';
  reason: string;
  isNewUser: boolean;
};

export type RiskScoringResult = {
  risk_score: number;
  decision: RiskDecision;
  triggered_rules: string[];
};
