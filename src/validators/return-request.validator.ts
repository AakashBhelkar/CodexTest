import { z } from 'zod';

export const returnRequestSchema = z.object({
  order_id: z.string().trim().min(1, 'order_id is required'),
  user_id: z.string().trim().min(1, 'user_id is required'),
  reason: z.string().trim().min(3, 'reason must be at least 3 characters'),
  product_category: z.string().trim().min(1, 'product_category is required'),
  payment_type: z.enum(['COD', 'prepaid']),
});

export type ReturnRequestInput = z.infer<typeof returnRequestSchema>;
