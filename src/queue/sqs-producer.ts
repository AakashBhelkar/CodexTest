import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

import { env } from '../config/env';
import type { ReturnRiskJobMessage } from '../types/queue';

const sqsClient = new SQSClient({ region: env.awsRegion });

export const enqueueReturnRiskJob = async (message: ReturnRiskJobMessage): Promise<void> => {
  const command = new SendMessageCommand({
    QueueUrl: env.sqsQueueUrl,
    MessageBody: JSON.stringify(message),
  });

  await sqsClient.send(command);
};
