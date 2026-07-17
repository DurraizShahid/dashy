import { Hono } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import { createDbClient, scraperSources, scraperRuns } from '@hivemind/db';
import { createScraperSourceSchema, createScraperRunSchema } from '@hivemind/shared';

const sourcesRouter = new Hono();

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  return createDbClient(url);
}

function iso(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : null;
}

function getTenantId(c: any): string {
  const tenantId = c.req.header('x-tenant-id');
  if (!tenantId) throw new Error('x-tenant-id header is required');
  return tenantId;
}

sourcesRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);

    const rows = await db
      .select()
      .from(scraperSources)
      .where(eq(scraperSources.tenantId, tenantId))
      .orderBy(scraperSources.name);

    const items = rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      status: r.status,
      leadsFound: r.leadsFound,
      hotLeads: r.hotLeads,
      lastRun: iso(r.lastRun),
      lastSuccess: iso(r.lastSuccess),
      errorCount: r.errorCount,
      successRate: r.successRate,
      avgScore: r.avgScore,
      createdAt: iso(r.createdAt)!,
      updatedAt: iso(r.updatedAt)!,
    }));

    return c.json({ success: true, data: items });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

sourcesRouter.get('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');

    const [row] = await db
      .select()
      .from(scraperSources)
      .where(and(eq(scraperSources.id, id), eq(scraperSources.tenantId, tenantId)))
      .limit(1);

    if (!row) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Source not found' } }, 404);
    }

    return c.json({
      success: true,
      data: {
        id: row.id,
        tenantId: row.tenantId,
        name: row.name,
        status: row.status,
        leadsFound: row.leadsFound,
        hotLeads: row.hotLeads,
        lastRun: iso(row.lastRun),
        lastSuccess: iso(row.lastSuccess),
        errorCount: row.errorCount,
        successRate: row.successRate,
        avgScore: row.avgScore,
        createdAt: iso(row.createdAt)!,
        updatedAt: iso(row.updatedAt)!,
      },
    });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

sourcesRouter.put('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));

    const [existing] = await db
      .select()
      .from(scraperSources)
      .where(and(eq(scraperSources.id, id), eq(scraperSources.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Source not found' } }, 404);
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status !== undefined) updateData.status = body.status;
    if (body.leadsFound !== undefined) updateData.leadsFound = body.leadsFound;
    if (body.hotLeads !== undefined) updateData.hotLeads = body.hotLeads;
    if (body.errorCount !== undefined) updateData.errorCount = body.errorCount;
    if (body.successRate !== undefined) updateData.successRate = body.successRate;
    if (body.avgScore !== undefined) updateData.avgScore = body.avgScore;
    if (body.lastRun !== undefined) updateData.lastRun = new Date(body.lastRun);
    if (body.lastSuccess !== undefined) updateData.lastSuccess = new Date(body.lastSuccess);

    const [updated] = await db
      .update(scraperSources)
      .set(updateData as any)
      .where(eq(scraperSources.id, id))
      .returning();

    return c.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        status: updated.status,
        updatedAt: iso(updated.updatedAt)!,
      },
    });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

sourcesRouter.get('/:id/runs', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const sourceName = c.req.param('id');
    const limit = Math.min(Number(c.req.query('limit')) || 20, 100);

    const rows = await db
      .select()
      .from(scraperRuns)
      .where(and(eq(scraperRuns.tenantId, tenantId), eq(scraperRuns.source, sourceName)))
      .orderBy(desc(scraperRuns.startedAt))
      .limit(limit);

    const items = rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      source: r.source,
      startedAt: iso(r.startedAt)!,
      completedAt: iso(r.completedAt),
      duration: r.duration,
      leadsFound: r.leadsFound,
      leadsAdded: r.leadsAdded,
      duplicatesSkipped: r.duplicatesSkipped,
      errors: r.errors,
      status: r.status,
      errorMessage: r.errorMessage,
      createdAt: iso(r.createdAt)!,
    }));

    return c.json({ success: true, data: items, total: items.length });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

export { sourcesRouter };
