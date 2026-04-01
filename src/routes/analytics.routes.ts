import { Router } from 'express';

import {
  approvedVsRejected,
  dailyTrends,
  fraudDetectedPercentage,
  totalReturns,
} from '../controllers/analytics.controller';

const analyticsRouter = Router();

analyticsRouter.get('/analytics/total-returns', totalReturns);
analyticsRouter.get('/analytics/fraud-detected-percentage', fraudDetectedPercentage);
analyticsRouter.get('/analytics/approved-vs-rejected', approvedVsRejected);
analyticsRouter.get('/analytics/daily-trends', dailyTrends);

export { analyticsRouter };
