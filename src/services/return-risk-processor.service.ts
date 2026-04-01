import { calculateReturnFraudRisk } from './risk-scoring.service';
import { evaluateOrganizationRules } from './rule-engine.service';
import { pool } from '../db/postgres';
import type { ReturnRiskJobMessage } from '../types/queue';

const decisionFromScore = (score: number): 'approved' | 'rejected' | 'review' => {
  if (score >= 70) {
    return 'rejected';
  }

  if (score >= 40) {
    return 'review';
  }

  return 'approved';
};

export const processReturnRiskJob = async (job: ReturnRiskJobMessage): Promise<void> => {
  const baseRisk = calculateReturnFraudRisk({
    returnCountLast90Days: 0,
    paymentType: job.payment_type,
    reason: job.reason,
    isNewUser: false,
  });

  const dynamicRisk = await evaluateOrganizationRules(
    job.organization_id,
    {
      return_count: 0,
      payment_type: job.payment_type,
    },
    baseRisk.risk_score,
  );

  const finalScore = dynamicRisk.total_risk;
  const decision = decisionFromScore(finalScore);
  const fraudDetected = finalScore >= 70;

  await pool.query(
    `
      UPDATE return_requests
      SET
        decision = $1,
        fraud_detected = $2
      WHERE request_id = $3
    `,
    [decision, fraudDetected, job.request_id],
  );
};
