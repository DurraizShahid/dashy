import { Hono } from 'hono';
import { z } from 'zod';
import { agentContextRequestSchema } from '@hivemind/shared';

const agentRouter = new Hono();

agentRouter.post('/context', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = agentContextRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request',
      details: parsed.error.flatten().fieldErrors,
    }, 400);
  }

  return c.json({
    accepted: false,
    message: 'Agent context retrieval not yet implemented. Planned: retrieve relevant documents, chunks, knowledge assets based on query.',
    plannedResponseShape: {
      context: {
        documents: 'DocumentChunk[]',
        knowledgeAssets: 'KnowledgeAsset[]',
        graphContext: 'GraphLink[]',
      },
      query: parsed.data.query,
      truncated: false,
    },
  }, 501);
});

export { agentRouter };
