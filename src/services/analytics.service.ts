import { pool } from '../db/postgres';

export const getTotalReturns = async (): Promise<{ total_returns: number }> => {
  const result = await pool.query<{ total_returns: string }>(
    'SELECT COUNT(*)::text AS total_returns FROM return_requests;',
  );

  return {
    total_returns: Number(result.rows[0]?.total_returns ?? 0),
  };
};

export const getFraudDetectedPercentage = async (): Promise<{ fraud_detected_percentage: number }> => {
  const result = await pool.query<{ fraud_detected_percentage: string }>(
    `
      SELECT
        COALESCE(ROUND(AVG(CASE WHEN fraud_detected THEN 1 ELSE 0 END) * 100, 2), 0)::text
        AS fraud_detected_percentage
      FROM return_requests;
    `,
  );

  return {
    fraud_detected_percentage: Number(result.rows[0]?.fraud_detected_percentage ?? 0),
  };
};

export const getApprovedVsRejected = async (): Promise<{
  approved: number;
  rejected: number;
  review: number;
}> => {
  const result = await pool.query<{
    decision: string;
    total: string;
  }>(
    `
      SELECT decision, COUNT(*)::text AS total
      FROM return_requests
      GROUP BY decision;
    `,
  );

  const counts = {
    approved: 0,
    rejected: 0,
    review: 0,
  };

  for (const row of result.rows) {
    if (row.decision === 'approved') {
      counts.approved = Number(row.total);
    }

    if (row.decision === 'rejected') {
      counts.rejected = Number(row.total);
    }

    if (row.decision === 'review') {
      counts.review = Number(row.total);
    }
  }

  return counts;
};

export const getDailyTrends = async (): Promise<{
  trends: Array<{ date: string; returns_count: number }>;
}> => {
  const result = await pool.query<{
    date: string;
    returns_count: string;
  }>(
    `
      SELECT
        TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS date,
        COUNT(*)::text AS returns_count
      FROM return_requests
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC;
    `,
  );

  return {
    trends: result.rows.map((row) => ({
      date: row.date,
      returns_count: Number(row.returns_count),
    })),
  };
};
