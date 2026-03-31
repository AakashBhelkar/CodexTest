import { app } from './app';
import { env } from './config/env';
import { initializeDatabase } from './db/postgres';
import { emitMonitoringEvent } from './monitoring/monitoring.hooks';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
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
};

process.on('unhandledRejection', (reason) => {
  logger.error('unhandled_rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
  emitMonitoringEvent('error', 'unhandled_rejection');
});

process.on('uncaughtException', (error) => {
  logger.error('uncaught_exception', { message: error.message });
  emitMonitoringEvent('error', 'uncaught_exception', { message: error.message });
});

void startServer();
