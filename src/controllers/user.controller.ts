import type { Request, Response } from 'express';

export const getProfile = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ message: 'unauthorized' });
    return;
  }

  res.status(200).json({
    message: 'protected data',
    user: req.user,
  });
};
