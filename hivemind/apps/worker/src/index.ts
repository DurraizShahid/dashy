import { validateEnv, createLogger } from '@hivemind/core';
import { QUEUE_NAMES } from '@hivemind/shared';
import { createQueues, createPlaceholderWorker } from './queues';
import type { ConnectionOptions } from 'bullmq';

const env = validateEnv();
const logger = createLogger('hivemind-worker');

logger.info({ env: env.NODE_ENV }, 'Starting Hive Mind Worker');

if (!env.REDIS_URL) {
  logger.fatal('REDIS_URL is required for worker');
  process.exit(1);
}

const { queues, connection, rawRedis } = createQueues(env.REDIS_URL);

const queueNames = Object.values(QUEUE_NAMES);
const workers = queueNames.map((name) => {
  logger.info({ queue: name }, 'Registering placeholder worker');
  return createPlaceholderWorker(name, connection);
});

logger.info({ workerCount: workers.length }, 'All placeholder workers registered');

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received');

  for (const worker of workers) {
    await worker.close();
  }

  for (const queue of Object.values(queues)) {
    await queue.close();
  }

  if (rawRedis) {
    rawRedis.disconnect();
  }
  logger.info('Graceful shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

logger.info('Hive Mind Worker ready');
