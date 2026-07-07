import { serve } from '@hono/node-server';
import { createApp } from './server';
import { createLogger, validateEnv } from '@hivemind/core';

const env = validateEnv();
const logger = createLogger('hivemind-api');

logger.info({ env: env.NODE_ENV, port: env.PORT }, 'Starting Hive Mind API');

const { app } = createApp();

serve({
  fetch: app.fetch,
  port: env.PORT,
}, (info) => {
  logger.info({ address: info.address, port: info.port }, 'Hive Mind API ready');
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  process.exit(0);
});
