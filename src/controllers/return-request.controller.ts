import type { Request, Response } from 'express';

import { enqueueReturnRiskJob } from '../queue/sqs-producer';
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
    const organizationId = String(req.query.organization_id ?? 'org_demo');

    await enqueueReturnRiskJob({
      request_id: result.request_id,
      ...parsed.data,
      organization_id: organizationId,
    });

    res.status(201).json(result);
  } catch {
    res.status(500).json({ message: 'failed to submit return request' });
  }
};
