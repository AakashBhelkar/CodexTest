import dotenv from 'dotenv';

dotenv.config();

const requiredKeys = [
  'JWT_SECRET',
  'DATABASE_URL',
  'SHOPIFY_WEBHOOK_SECRET',
  'AWS_REGION',
  'SQS_QUEUE_URL',
] as const;

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  databaseUrl: process.env.DATABASE_URL as string,
  shopifyWebhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET as string,
  awsRegion: process.env.AWS_REGION as string,
  sqsQueueUrl: process.env.SQS_QUEUE_URL as string,
};
