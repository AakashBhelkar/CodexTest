import type { NextFunction, Request, Response } from 'express';

import { emitMonitoringEvent } from '../monitoring/monitoring.hooks';
import { logger } from '../utils/logger';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const error = err instanceof Error ? err : new Error('Unknown error');

  const payload = {
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    method: req.method,
    path: req.originalUrl,
  };

  logger.error('request_error', payload);
  emitMonitoringEvent('error', 'http_request_error', payload);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    message: 'Internal Server Error',
  });
};
