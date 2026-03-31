import { Router } from 'express';

import { login, signup } from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/security.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { authSchema } from '../validators/auth.validator';

const authRouter = Router();

authRouter.post('/signup', authRateLimiter, validateBody(authSchema), signup);
authRouter.post('/login', authRateLimiter, validateBody(authSchema), login);

export { authRouter };
