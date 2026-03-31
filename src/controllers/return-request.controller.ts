import type { Request, Response } from 'express';

import { createReturnRequest } from '../services/return-request.service';
import { returnRequestSchema } from '../validators/return-request.validator';

export const submitReturnRequest = async (req: Request, res: Response): Promise<void> => {
  const parsed = returnRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: 'validation failed',
      errors: parsed.error.flatten(),
    });
    return;
  }

  try {
    const result = await createReturnRequest(parsed.data);
    res.status(201).json(result);
  } catch {
    res.status(500).json({ message: 'failed to submit return request' });
  }
};
