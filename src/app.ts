import 'express-async-errors';
import express from 'express';

import { authRouter } from './routes/auth.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware';
import { apiRateLimiter, helmetMiddleware } from './middleware/security.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { protectedRouter } from './routes/protected.routes';
import { returnRequestRouter } from './routes/return-request.routes';
import { ruleEngineRouter } from './routes/rule-engine.routes';
import { shopifyWebhookRouter } from './routes/shopify-webhook.routes';

const app = express();
app.set('trust proxy', 1);

app.use('/webhooks', shopifyWebhookRouter);

app.use(helmetMiddleware);
app.use(apiRateLimiter);
app.use(express.json());
app.use(requestLogger);
import express from 'express';

import { authRouter } from './routes/auth.routes';
import { protectedRouter } from './routes/protected.routes';
import { returnRequestRouter } from './routes/return-request.routes';
import { ruleEngineRouter } from './routes/rule-engine.routes';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api', analyticsRouter);
app.use('/api', protectedRouter);
app.use('/api', returnRequestRouter);
app.use('/api', ruleEngineRouter);
app.use(notFoundHandler);
app.use(errorHandler);
app.use('/api', protectedRouter);
app.use('/api', returnRequestRouter);
app.use('/api', ruleEngineRouter);

export { app };
