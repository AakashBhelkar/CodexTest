import { Pool } from 'pg';

import { env } from '../config/env';

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

export const initializeDatabase = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS return_requests (
      request_id UUID PRIMARY KEY,
      order_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      product_category TEXT NOT NULL,
      payment_type TEXT NOT NULL CHECK (payment_type IN ('COD', 'prepaid')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON return_requests(user_id);',
  );

  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON return_requests(order_id);',
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS risk_rules (
      id UUID PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      priority INT NOT NULL DEFAULT 100,
      conditions JSONB NOT NULL,
      action_value INT NOT NULL CHECK (action_value >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (organization_id, name)
    );
  `);

  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_risk_rules_org_priority ON risk_rules(organization_id, is_active, priority);',
  );

  await pool.query(
    `
      INSERT INTO risk_rules (
        id,
        organization_id,
        name,
        is_active,
        priority,
        conditions,
        action_value
      ) VALUES (
        '3a5f291d-c2be-4443-8913-efcd1305a3ce',
        'org_demo',
        'High return count + COD',
        true,
        10,
        $1::jsonb,
        40
      )
      ON CONFLICT (organization_id, name) DO NOTHING;
    `,
    [
      JSON.stringify([
        { field: 'return_count', operator: 'gt', value: 3 },
        { field: 'payment_type', operator: 'eq', value: 'COD' },
      ]),
    ],
  );
};
