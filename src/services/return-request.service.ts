import { randomUUID } from 'node:crypto';

import { pool } from '../db/postgres';
import type { ReturnRequestInput } from '../validators/return-request.validator';

export const createReturnRequest = async (
  input: ReturnRequestInput,
): Promise<{ request_id: string }> => {
  const requestId = randomUUID();

  await pool.query(
    `
      INSERT INTO return_requests (
        request_id,
        order_id,
        user_id,
        reason,
        product_category,
        payment_type
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      requestId,
      input.order_id,
      input.user_id,
      input.reason,
      input.product_category,
      input.payment_type,
    ],
  );

  return { request_id: requestId };
};
