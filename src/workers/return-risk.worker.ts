import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
  type Message,
} from '@aws-sdk/client-sqs';

import { env } from '../config/env';
import { initializeDatabase } from '../db/postgres';
import { processReturnRiskJob } from '../services/return-risk-processor.service';
import type { ReturnRiskJobMessage } from '../types/queue';

const sqsClient = new SQSClient({ region: env.awsRegion });
const MAX_RETRIES = 3;

const processMessage = async (message: Message): Promise<void> => {
  if (!message.Body || !message.ReceiptHandle) {
    return;
  }

  const receiveCount = Number(message.Attributes?.ApproximateReceiveCount ?? 1);

  try {
    const parsed = JSON.parse(message.Body) as ReturnRiskJobMessage;
    await processReturnRiskJob(parsed);

    await sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: env.sqsQueueUrl,
        ReceiptHandle: message.ReceiptHandle,
      }),
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to process SQS message', { error, receiveCount });

    if (receiveCount >= MAX_RETRIES) {
      // eslint-disable-next-line no-console
      console.error('Max retries reached, removing message from queue');
      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: env.sqsQueueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );
    }
  }
};

const poll = async (): Promise<void> => {
  const response = await sqsClient.send(
    new ReceiveMessageCommand({
      QueueUrl: env.sqsQueueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
      VisibilityTimeout: 30,
      AttributeNames: ['ApproximateReceiveCount'],
    }),
  );

  const messages = response.Messages ?? [];
  await Promise.all(messages.map((message) => processMessage(message)));
};

const startWorker = async (): Promise<void> => {
  await initializeDatabase();

  // eslint-disable-next-line no-console
  console.log('SQS return-risk worker started');

  while (true) {
    try {
      await poll();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Worker polling error', error);
    }
  }
};

void startWorker();
