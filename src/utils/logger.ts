/* eslint-disable no-console */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const priority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel = (process.env.LOG_LEVEL as LogLevel | undefined) ?? 'info';

const shouldLog = (level: LogLevel): boolean => priority[level] >= priority[currentLevel];

const write = (level: LogLevel, message: string, metadata?: Record<string, unknown>): void => {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(metadata ?? {}),
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
};

export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>) => write('debug', message, metadata),
  info: (message: string, metadata?: Record<string, unknown>) => write('info', message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) => write('warn', message, metadata),
  error: (message: string, metadata?: Record<string, unknown>) => write('error', message, metadata),
};
