import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug';

export function createLogger(serviceName = 'hivemind'): pino.Logger {
  return pino({
    name: serviceName,
    level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
    redact: {
      paths: [
        'DATABASE_URL', 'REDIS_URL', 'MINIO_SECRET_KEY', 'MINIO_ACCESS_KEY',
        'NEO4J_PASSWORD', 'HIVEMIND_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY',
        '*.password', '*.secret', '*.token', '*.key', '*.authorization',
        'req.headers.authorization',
      ],
      censor: '<redacted>',
    },
  });
}

let defaultLogger: pino.Logger | undefined;

export function getLogger(): pino.Logger {
  if (!defaultLogger) {
    defaultLogger = createLogger();
  }
  return defaultLogger;
}

export function setLogger(logger: pino.Logger): void {
  defaultLogger = logger;
}
