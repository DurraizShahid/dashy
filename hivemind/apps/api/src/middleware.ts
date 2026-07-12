import { createMiddleware } from 'hono/factory';
import { getLogger } from '@hivemind/core';
import type { Env } from '@hivemind/core';

export function requestIdMiddleware() {
  return createMiddleware(async (c, next) => {
    const requestId = crypto.randomUUID();
    c.set('requestId', requestId);
    c.header('X-Request-Id', requestId);
    await next();
  });
}

export function corsMiddleware(allowedOrigins: string[] = ['*']) {
  return createMiddleware(async (c, next) => {
    const origin = c.req.header('Origin') ?? '';
    const allow = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
    if (allow) {
      c.header('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin);
      c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
      c.header('Access-Control-Max-Age', '86400');
    }
    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }
    await next();
  });
}

export function authMiddleware(env: Env) {
  return createMiddleware(async (c, next) => {
    if (env.AUTH_MODE === 'api-key') {
      const apiKey = c.req.header('X-API-Key');
      if (apiKey && env.HIVEMIND_API_KEY && apiKey === env.HIVEMIND_API_KEY) {
        c.set('auth', { type: 'api-key' });
        return await next();
      }
      return c.json({ code: 'AUTHENTICATION_ERROR', message: 'Invalid API key' }, 401);
    }
    c.set('auth', { type: 'anonymous' });
    await next();
  });
}

export function errorHandler() {
  return createMiddleware(async (c, next) => {
    try {
      await next();
    } catch (err) {
      const logger = getLogger();
      const requestId = c.get('requestId') ?? 'unknown';
      if (err instanceof Error) {
        logger.error({ err, requestId }, 'Unhandled error');
        const statusCode = (err as any).statusCode ?? 500;
        return c.json({
          code: (err as any).code ?? 'INTERNAL_ERROR',
          message: err.message,
          requestId,
        }, statusCode);
      }
      logger.error({ err, requestId }, 'Unknown error');
      return c.json({ code: 'INTERNAL_ERROR', message: 'Internal server error', requestId }, 500);
    }
  });
}
