import express, { Router } from 'express';

import { shopifyReturnWebhook } from '../controllers/shopify-webhook.controller';

const shopifyWebhookRouter = Router();

shopifyWebhookRouter.post(
  '/shopify/returns',
  express.raw({ type: 'application/json' }),
  shopifyReturnWebhook,
);

export { shopifyWebhookRouter };
