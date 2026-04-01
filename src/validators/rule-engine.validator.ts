import { z } from 'zod';

export const evaluateRulesSchema = z.object({
  organization_id: z.string().trim().min(1, 'organization_id is required'),
  return_count: z.number().int().min(0),
  payment_type: z.enum(['COD', 'prepaid']),
  base_risk: z.number().min(0).max(100).optional(),
});
