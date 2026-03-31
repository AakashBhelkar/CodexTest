import { Router } from 'express';

import { submitReturnRequest } from '../controllers/return-request.controller';

const returnRequestRouter = Router();

returnRequestRouter.post('/returns', submitReturnRequest);

export { returnRequestRouter };
