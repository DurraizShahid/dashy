import { Hono } from 'hono';
import { serviceRegistry } from '@hivemind/core';

const registryRouter = new Hono();

registryRouter.get('/', (c) => {
  const safe = serviceRegistry.map((s) => ({
    key: s.key,
    displayName: s.displayName,
    category: s.category,
    purpose: s.purpose,
    requiredForPhase2: s.requiredForPhase2,
    publicExposureRecommended: s.publicExposureRecommended,
  }));
  return c.json({ services: safe });
});

export { registryRouter };
