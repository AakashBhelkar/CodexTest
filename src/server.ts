import { app } from './app';
import { env } from './config/env';
import { initializeDatabase } from './db/postgres';

const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Auth API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();
