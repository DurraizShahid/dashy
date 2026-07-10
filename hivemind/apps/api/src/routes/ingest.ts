import { Hono } from 'hono';
import { ingestUrlRequestSchema, ingestFileRequestSchema } from '@hivemind/shared';

const ingestRouter = new Hono();

ingestRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const contentType = c.req.header('Content-Type') ?? '';

  if (contentType.includes('multipart')) {
    return c.json({
      accepted: false,
      message: 'File ingestion not yet implemented. Planned: upload to MinIO, enqueue parse/index/graph jobs.',
    }, 501);
  }

  if (body.url) {
    const parsed = ingestUrlRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid URL ingestion request',
        details: parsed.error.flatten().fieldErrors,
      }, 400);
    }
    return c.json({
      accepted: false,
      message: 'URL ingestion not yet implemented. Planned: crawl URL, archive, parse, chunk, embed, graph.',
      plannedFlow: [
        'validate URL',
        'enqueue ingest.url job',
        'worker crawls URL via Crawl4AI',
        'archive to ArchiveBox',
        'ingest into RAGFlow for parsing',
        'chunk and embed into Qdrant',
        'extract entities into Neo4j via Graphiti',
      ],
      url: parsed.data.url,
    }, 501);
  }

  if (body.filename) {
    const parsed = ingestFileRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid file ingestion request',
        details: parsed.error.flatten().fieldErrors,
      }, 400);
    }
    return c.json({
      accepted: false,
      message: 'File ingestion not yet implemented. Planned: upload to MinIO, parse, chunk, embed, graph.',
    }, 501);
  }

  return c.json({ code: 'VALIDATION_ERROR', message: 'Provide url or filename' }, 400);
});

export { ingestRouter };
