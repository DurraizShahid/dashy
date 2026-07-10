import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import Redis from 'ioredis';
import { QUEUE_NAMES } from '@hivemind/shared';
import { createLogger } from '@hivemind/core';

const logger = createLogger('hivemind-worker');

export function createQueues(redisUrl: string) {
  const rawRedis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  const connection = rawRedis as unknown as ConnectionOptions;

  const queues = {
    [QUEUE_NAMES.INGEST_URL]: new Queue(QUEUE_NAMES.INGEST_URL, { connection }),
    [QUEUE_NAMES.INGEST_FILE]: new Queue(QUEUE_NAMES.INGEST_FILE, { connection }),
    [QUEUE_NAMES.PARSE_DOCUMENT]: new Queue(QUEUE_NAMES.PARSE_DOCUMENT, { connection }),
    [QUEUE_NAMES.INDEX_VECTOR]: new Queue(QUEUE_NAMES.INDEX_VECTOR, { connection }),
    [QUEUE_NAMES.INDEX_GRAPH]: new Queue(QUEUE_NAMES.INDEX_GRAPH, { connection }),
    [QUEUE_NAMES.SUMMARIZE_DOCUMENT]: new Queue(QUEUE_NAMES.SUMMARIZE_DOCUMENT, { connection }),
  };

  logger.info({ queueCount: Object.keys(queues).length }, 'BullMQ queues initialized');

  return { queues, connection, rawRedis };
}

export function createPlaceholderWorker(queueName: string, connection: ConnectionOptions): Worker {
  const worker = new Worker(
    queueName,
    async (job) => {
      logger.warn({ jobId: job.id, queueName, data: job.data }, 'Placeholder processor: job not implemented');
      return { processed: false, message: `${queueName} processor not yet implemented` };
    },
    { connection, concurrency: 1 },
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, queueName }, 'Job completed (placeholder)');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, queueName, err: err.message }, 'Job failed (placeholder)');
  });

  return worker;
}
