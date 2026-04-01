import { app } from './app';
import { env } from './config/env';
import { initializeDatabase } from './db/postgres';
import { emitMonitoringEvent } from './monitoring/monitoring.hooks';
import { logger } from './utils/logger';

function onUnhandledRejection(reason: unknown): void {
  logger.error('unhandled_rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
  emitMonitoringEvent('error', 'unhandled_rejection');
}

function onUncaughtException(error: Error): void {
  logger.error('uncaught_exception', { message: error.message });
  emitMonitoringEvent('error', 'uncaught_exception', { message: error.message });
}

async function startServer(): Promise<void> {
  try {
    await initializeDatabase();

    app.listen(env.port, () => {
      logger.info('server_started', { port: env.port });
      emitMonitoringEvent('health', 'server_started', { port: env.port });
    });
  } catch (error) {
    logger.error('server_start_failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    emitMonitoringEvent('error', 'server_start_failed');
    process.exit(1);
  }
}

process.on('unhandledRejection', onUnhandledRejection);
process.on('uncaughtException', onUncaughtException);

void startServer();
