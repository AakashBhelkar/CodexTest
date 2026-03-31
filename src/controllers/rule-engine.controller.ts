import type { Request, Response } from 'express';

import { evaluateOrganizationRules } from '../services/rule-engine.service';
import { evaluateRulesSchema } from '../validators/rule-engine.validator';

export const evaluateRules = async (req: Request, res: Response): Promise<void> => {
  const parsed = evaluateRulesSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: 'validation failed',
      errors: parsed.error.flatten(),
    });
    return;
  }

  const payload = parsed.data;
  try {
    const result = await evaluateOrganizationRules(
      payload.organization_id,
      {
        return_count: payload.return_count,
        payment_type: payload.payment_type,
      },
      payload.base_risk ?? 0,
    );

    res.status(200).json(result);
  } catch {
    res.status(500).json({ message: 'failed to evaluate rules' });
  }
};
