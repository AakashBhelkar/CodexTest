import type { NextFunction, Request, Response } from 'express';

import { emitMonitoringEvent } from '../monitoring/monitoring.hooks';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    const payload = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      requestId: req.header('x-request-id') ?? null,
    };

    logger.info('http_request', payload);
    emitMonitoringEvent('request', 'http_request_finished', payload);
  });

  next();
};
