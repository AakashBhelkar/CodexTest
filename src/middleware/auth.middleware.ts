import type { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../utils/jwt';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'invalid or expired token' });
  }
};
