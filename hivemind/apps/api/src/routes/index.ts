import { Hono } from 'hono';
import { HIVEMIND_VERSION } from '@hivemind/shared';

const indexRouter = new Hono();

indexRouter.get('/', (c) => {
  return c.json({
    service: 'Hive Mind API',
    version: HIVEMIND_VERSION,
    status: 'running',
  });
});

export { indexRouter };
