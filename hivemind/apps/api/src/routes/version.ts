import { Hono } from 'hono';
import { HIVEMIND_VERSION } from '@hivemind/shared';

const versionRouter = new Hono();

versionRouter.get('/', (c) => {
  return c.json({
    version: HIVEMIND_VERSION,
    commit: process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? null,
    buildTime: process.env.BUILD_TIME ?? null,
  });
});

export { versionRouter };
