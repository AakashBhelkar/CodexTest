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
app.use('/api', protectedRouter);
app.use('/api', returnRequestRouter);
app.use('/api', ruleEngineRouter);

export { app };
