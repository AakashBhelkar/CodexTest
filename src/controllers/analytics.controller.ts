import type { Request, Response } from 'express';

import {
  getApprovedVsRejected,
  getDailyTrends,
  getFraudDetectedPercentage,
  getTotalReturns,
} from '../services/analytics.service';

export const totalReturns = async (_req: Request, res: Response): Promise<void> => {
  const result = await getTotalReturns();
  res.status(200).json(result);
};

export const fraudDetectedPercentage = async (_req: Request, res: Response): Promise<void> => {
  const result = await getFraudDetectedPercentage();
  res.status(200).json(result);
};

export const approvedVsRejected = async (_req: Request, res: Response): Promise<void> => {
  const result = await getApprovedVsRejected();
  res.status(200).json(result);
};

export const dailyTrends = async (_req: Request, res: Response): Promise<void> => {
  const result = await getDailyTrends();
  res.status(200).json(result);
};
