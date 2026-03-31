import type { RiskDecision, RiskScoringInput, RiskScoringResult } from '../types/risk';

const HIGH_FREQUENCY_THRESHOLD = 3;
const MAX_RISK_SCORE = 100;

const WEIGHTS = {
  highFrequencyReturns: 30,
  codOrder: 20,
  suspiciousReason: 25,
  newUser: 15,
} as const;

const SUSPICIOUS_KEYWORDS = [
  'empty box',
  'wrong item',
  'fake',
  'not delivered',
  'damaged seal',
] as const;

const containsSuspiciousReason = (reason: string): boolean => {
  const normalizedReason = reason.toLowerCase();
  return SUSPICIOUS_KEYWORDS.some((keyword) => normalizedReason.includes(keyword));
};

const getDecision = (riskScore: number): RiskDecision => {
  if (riskScore >= 70) {
    return 'reject';
  }

  if (riskScore >= 40) {
    return 'review';
  }

  return 'approve';
};

const clampScore = (score: number): number => {
  return Math.max(0, Math.min(MAX_RISK_SCORE, score));
};

export const calculateReturnFraudRisk = (input: RiskScoringInput): RiskScoringResult => {
  let score = 0;
  const triggeredRules: string[] = [];

  if (input.returnCountLast90Days >= HIGH_FREQUENCY_THRESHOLD) {
    score += WEIGHTS.highFrequencyReturns;
    triggeredRules.push('high_frequency_returns');
  }

  if (input.paymentType === 'COD') {
    score += WEIGHTS.codOrder;
    triggeredRules.push('cod_order');
  }

  if (containsSuspiciousReason(input.reason)) {
    score += WEIGHTS.suspiciousReason;
    triggeredRules.push('suspicious_reason_keyword');
  }

  if (input.isNewUser) {
    score += WEIGHTS.newUser;
    triggeredRules.push('new_user');
  }

  const riskScore = clampScore(score);

  return {
    risk_score: riskScore,
    decision: getDecision(riskScore),
    triggered_rules: triggeredRules,
  };
};
