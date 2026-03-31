import { Router } from 'express';

import { getProfile } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';

const protectedRouter = Router();

protectedRouter.get('/me', requireAuth, getProfile);

export { protectedRouter };
