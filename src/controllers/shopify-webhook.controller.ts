import type { Request, Response } from 'express';

import { env } from '../config/env';
import {
  parseShopifyReturnEvent,
  triggerReturnVerificationProcess,
  verifyShopifyWebhookSignature,
} from '../services/shopify-webhook.service';
import type { ShopifyReturnWebhookPayload } from '../types/shopify';

export const shopifyReturnWebhook = async (req: Request, res: Response): Promise<void> => {
  const hmac = req.header('X-Shopify-Hmac-Sha256');

  if (!hmac) {
    res.status(401).json({ message: 'missing webhook signature' });
    return;
  }

  const rawBody = req.body as Buffer;

  const isValid = verifyShopifyWebhookSignature(rawBody, hmac, env.shopifyWebhookSecret);
  if (!isValid) {
    res.status(401).json({ message: 'invalid webhook signature' });
    return;
  }

  let payload: ShopifyReturnWebhookPayload;

  try {
    payload = JSON.parse(rawBody.toString('utf-8')) as ShopifyReturnWebhookPayload;
  } catch {
    res.status(400).json({ message: 'invalid json payload' });
    return;
  }

  const parsedEvent = parseShopifyReturnEvent(payload);

  const organizationId = String(req.query.organization_id ?? 'org_demo');
  await triggerReturnVerificationProcess(organizationId, parsedEvent);

  res.status(202).json({
    message: 'webhook accepted',
    order_id: parsedEvent.orderId,
  });
};
