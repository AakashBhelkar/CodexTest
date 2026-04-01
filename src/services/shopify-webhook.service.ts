import crypto from 'node:crypto';

import { calculateReturnFraudRisk } from './risk-scoring.service';
import { evaluateOrganizationRules } from './rule-engine.service';
import type { ParsedReturnEvent, ShopifyReturnWebhookPayload } from '../types/shopify';

export const verifyShopifyWebhookSignature = (
  rawBody: Buffer,
  receivedHmac: string,
  secret: string,
): boolean => {
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

  const digestBuffer = Buffer.from(digest);
  const hmacBuffer = Buffer.from(receivedHmac);

  if (digestBuffer.length !== hmacBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, hmacBuffer);
};

export const parseShopifyReturnEvent = (payload: ShopifyReturnWebhookPayload): ParsedReturnEvent => {
  const paymentGateway = String(payload.gateway ?? '').toLowerCase();

  const paymentType: ParsedReturnEvent['paymentType'] = paymentGateway.includes('cod')
    ? 'COD'
    : 'prepaid';

  const orderId = String(payload.order_id ?? payload.id ?? '');
  const userId = String(payload.customer?.id ?? payload.customer?.email ?? 'guest_user');
  const reason = String(payload.note ?? 'No reason provided');
  const productCategory = String(payload.line_items?.[0]?.product_type ?? 'unknown');

  return {
    orderId,
    userId,
    paymentType,
    reason,
    productCategory,
  };
};

export const triggerReturnVerificationProcess = async (
  organizationId: string,
  parsedEvent: ParsedReturnEvent,
): Promise<{
  base_risk_score: number;
  final_risk_score: number;
  decision: 'approve' | 'review' | 'reject';
}> => {
  const decisionFromScore = (score: number): 'approve' | 'review' | 'reject' => {
    if (score >= 70) {
      return 'reject';
    }

    if (score >= 40) {
      return 'review';
    }

    return 'approve';
  };

  const baseRisk = calculateReturnFraudRisk({
    returnCountLast90Days: 0,
    paymentType: parsedEvent.paymentType,
    reason: parsedEvent.reason,
    isNewUser: false,
  });

  const dynamicRuleResult = await evaluateOrganizationRules(
    organizationId,
    {
      return_count: 0,
      payment_type: parsedEvent.paymentType,
    },
    baseRisk.risk_score,
  );

  return {
    base_risk_score: baseRisk.risk_score,
    final_risk_score: dynamicRuleResult.total_risk,
    decision: decisionFromScore(dynamicRuleResult.total_risk),
  };
};
