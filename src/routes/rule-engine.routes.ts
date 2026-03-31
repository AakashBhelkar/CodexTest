import { Router } from 'express';

import { evaluateRules } from '../controllers/rule-engine.controller';

const ruleEngineRouter = Router();

ruleEngineRouter.post('/risk/evaluate', evaluateRules);

export { ruleEngineRouter };
