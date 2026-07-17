import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, like, inArray, sql, or } from 'drizzle-orm';
import { createDbClient, leads, companies, contacts, tenants } from '@hivemind/db';
import { createLeadSchema, updateLeadSchema, leadIngestSchema, CRM_PRODUCTS } from '@hivemind/shared';

const leadsRouter = new Hono();

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  return createDbClient(url);
}

function iso(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : null;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

const TENANT_HEADER = 'x-tenant-id';

function getTenantId(c: any): string {
  const tenantId = c.req.header(TENANT_HEADER);
  if (!tenantId) {
    const auth = c.get('auth') as { type: string; sub?: string };
    throw new Error('x-tenant-id header is required');
  }
  return tenantId;
}

leadsRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const status = c.req.query('status');
    const product = c.req.query('product');
    const source = c.req.query('source');
    const market = c.req.query('market');
    const intent = c.req.query('intent');
    const search = c.req.query('search');
    const assigned = c.req.query('assigned');
    const limit = Math.min(Number(c.req.query('limit')) || 50, 200);
    const offset = Number(c.req.query('offset')) || 0;

    const conditions: any[] = [eq(leads.tenantId, tenantId)];

    if (status) conditions.push(eq(leads.status, status));
    if (product) conditions.push(eq(leads.product, product));
    if (source) conditions.push(eq(leads.source, source));
    if (market) conditions.push(eq(leads.market, market));
    if (intent) conditions.push(eq(leads.intentLevel, intent));
    if (assigned) conditions.push(eq(leads.assignedUser, assigned));
    if (search) {
      conditions.push(
        or(
          like(leads.companyName, `%${search}%`),
          like(leads.contactName, `%${search}%`),
          like(leads.country, `%${search}%`),
          like(leads.city, `%${search}%`),
        ),
      );
    }

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(...conditions));

    const rows = await db
      .select()
      .from(leads)
      .where(and(...conditions))
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    const items = rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      companyName: r.companyName,
      contactName: r.contactName,
      product: r.product,
      industry: r.industry,
      market: r.market,
      country: r.country,
      city: r.city,
      source: r.source,
      sourceUrl: r.sourceUrl,
      leadScore: r.leadScore,
      intentLevel: r.intentLevel,
      status: r.status,
      painPoints: r.painPoints ?? [],
      suggestedAngle: r.suggestedAngle,
      aiSummary: r.aiSummary,
      assignedUser: r.assignedUser,
      duplicateKey: r.duplicateKey,
      isDuplicate: r.isDuplicate,
      createdAt: iso(r.createdAt)!,
      updatedAt: iso(r.updatedAt)!,
      lastSeenAt: iso(r.lastSeenAt),
    }));

    return c.json({
      success: true,
      data: items,
      total: totalResult?.count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

leadsRouter.get('/hot', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const minScore = Number(c.req.query('minScore')) || 80;
    const limit = Math.min(Number(c.req.query('limit')) || 20, 100);

    const rows = await db
      .select()
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), sql`${leads.leadScore} >= ${minScore}`))
      .orderBy(desc(leads.leadScore))
      .limit(limit);

    const items = rows.map((r) => ({
      id: r.id,
      companyName: r.companyName,
      contactName: r.contactName,
      product: r.product,
      market: r.market,
      country: r.country,
      source: r.source,
      leadScore: r.leadScore,
      intentLevel: r.intentLevel,
      status: r.status,
      painPoints: r.painPoints ?? [],
      assignedUser: r.assignedUser,
      createdAt: iso(r.createdAt)!,
    }));

    return c.json({ success: true, data: items, total: items.length });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

leadsRouter.get('/duplicates', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);

    const rows = await db
      .select()
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), eq(leads.isDuplicate, true)))
      .orderBy(desc(leads.createdAt));

    const items = rows.map((r) => ({
      id: r.id,
      companyName: r.companyName,
      contactName: r.contactName,
      product: r.product,
      source: r.source,
      leadScore: r.leadScore,
      status: r.status,
      duplicateKey: r.duplicateKey,
      createdAt: iso(r.createdAt)!,
    }));

    return c.json({ success: true, data: items, total: items.length });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

leadsRouter.get('/stats', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);

    const [totals] = await db
      .select({
        total: sql<number>`count(*)::int`,
        hot: sql<number>`count(*) filter (where ${leads.leadScore} >= 80)::int`,
        new: sql<number>`count(*) filter (where ${leads.status} = 'New')::int`,
        converted: sql<number>`count(*) filter (where ${leads.status} in ('Won', 'Demo Booked'))::int`,
      })
      .from(leads)
      .where(eq(leads.tenantId, tenantId));

    const productBreakdown = await db
      .select({
        product: leads.product,
        count: sql<number>`count(*)::int`,
        hot: sql<number>`count(*) filter (where ${leads.leadScore} >= 80)::int`,
      })
      .from(leads)
      .where(eq(leads.tenantId, tenantId))
      .groupBy(leads.product)
      .orderBy(sql`count(*) desc`);

    const sourceBreakdown = await db
      .select({
        source: leads.source,
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .where(eq(leads.tenantId, tenantId))
      .groupBy(leads.source)
      .orderBy(sql`count(*) desc`);

    const marketBreakdown = await db
      .select({
        market: leads.market,
        count: sql<number>`count(*)::int`,
        hot: sql<number>`count(*) filter (where ${leads.leadScore} >= 80)::int`,
      })
      .from(leads)
      .where(eq(leads.tenantId, tenantId))
      .groupBy(leads.market)
      .orderBy(sql`count(*) desc`);

    return c.json({
      success: true,
      data: {
        totalLeads: totals?.total ?? 0,
        hotLeads: totals?.hot ?? 0,
        newLeads: totals?.new ?? 0,
        convertedLeads: totals?.converted ?? 0,
        leadsByProduct: productBreakdown,
        leadsBySource: sourceBreakdown,
        leadsByMarket: marketBreakdown,
      },
    });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

leadsRouter.get('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');

    const [row] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .limit(1);

    if (!row) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } }, 404);
    }

    return c.json({
      success: true,
      data: {
        id: row.id,
        tenantId: row.tenantId,
        companyName: row.companyName,
        contactName: row.contactName,
        product: row.product,
        industry: row.industry,
        market: row.market,
        country: row.country,
        city: row.city,
        source: row.source,
        sourceUrl: row.sourceUrl,
        leadScore: row.leadScore,
        intentLevel: row.intentLevel,
        status: row.status,
        painPoints: row.painPoints ?? [],
        suggestedAngle: row.suggestedAngle,
        aiSummary: row.aiSummary,
        assignedUser: row.assignedUser,
        duplicateKey: row.duplicateKey,
        isDuplicate: row.isDuplicate,
        createdAt: iso(row.createdAt)!,
        updatedAt: iso(row.updatedAt)!,
        lastSeenAt: iso(row.lastSeenAt),
      },
    });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

leadsRouter.post('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const body = await c.req.json().catch(() => ({}));
    const parsed = createLeadSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid lead data', details: parsed.error.flatten().fieldErrors },
      }, 400);
    }

    const data = parsed.data;
    const duplicateKey = data.duplicateKey || `${data.companyName}_${data.country}_${data.city || ''}`.toLowerCase();

    const [row] = await db
      .insert(leads)
      .values({
        tenantId,
        companyName: data.companyName,
        contactName: data.contactName ?? null,
        product: data.product,
        industry: data.industry ?? null,
        market: data.market,
        country: data.country,
        city: data.city ?? null,
        source: data.source,
        sourceUrl: data.sourceUrl ?? null,
        leadScore: data.leadScore ?? 0,
        intentLevel: data.intentLevel ?? null,
        status: data.status ?? (data.leadScore && data.leadScore >= 80 ? 'New' : 'New'),
        painPoints: data.painPoints ?? [],
        suggestedAngle: data.suggestedAngle ?? null,
        aiSummary: data.aiSummary ?? null,
        assignedUser: data.assignedUser ?? null,
        duplicateKey,
        isDuplicate: false,
      })
      .returning();

    return c.json({
      success: true,
      data: {
        id: row.id,
        companyName: row.companyName,
        product: row.product,
        status: row.status,
        leadScore: row.leadScore,
        createdAt: iso(row.createdAt)!,
      },
    }, 201);
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

leadsRouter.post('/ingest', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const body = await c.req.json().catch(() => ({}));

    const marketMap: Record<string, string> = {
      'usa': 'USA', 'uk': 'UK', 'australia': 'Australia', 'gcc': 'GCC',
      'uae': 'GCC', 'saudi': 'GCC', 'qatar': 'GCC',
    };

    const companyName = body.companyName || body.title || body.company || 'Unknown';
    const contactName = body.author || body.contactName || null;
    const market = body.market || 'Other';
    const country = body.country || marketMap[market.toLowerCase()] || 'Other';
    const score = body.leadScore ?? body.score ?? 0;
    const sourceUrl = body.sourceUrl || body.url || null;
    const painPoints = body.painPoints || body.painMatches || [];
    const aiSummary = body.aiSummary || body.selftext || null;

    const duplicateKey = body.duplicateKey || `${companyName}_${country}_${body.city || ''}`.toLowerCase();

    let leadStatus = body.status || 'New';
    let shouldSendToSlack = false;

    if (score >= 80) {
      leadStatus = 'New';
      shouldSendToSlack = true;
    }

    const normalizedProduct = CRM_PRODUCTS.includes(body.product as any) ? body.product : 'Needs Review';
    if (normalizedProduct === 'Needs Review') {
      leadStatus = 'Needs Review';
    }

    const [existing] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), eq(leads.duplicateKey, duplicateKey)))
      .limit(1);

    if (existing) {
      await db
        .update(leads)
        .set({
          lastSeenAt: new Date(),
          leadScore: Math.max(existing.leadScore, score),
          updatedAt: new Date(),
        })
        .where(eq(leads.id, existing.id));

      return c.json({
        success: true,
        status: 'duplicate',
        leadId: existing.id,
        isDuplicate: true,
        shouldSendToSlack: false,
        message: 'Lead already exists, updated score',
      });
    }

    const rawData: Record<string, unknown> = {};
    for (const key of ['title', 'selftext', 'author', 'sourceId', 'subreddit', 'upvotes', 'comments', 'productMatches', 'painMatches', 'contactEmail', 'contactPhone', 'company']) {
      if (body[key] !== undefined) rawData[key] = body[key];
    }

    const [row] = await db
      .insert(leads)
      .values({
        tenantId,
        companyName,
        contactName,
        product: normalizedProduct,
        industry: body.industry ?? null,
        market,
        country,
        city: body.city ?? null,
        source: body.source,
        sourceUrl,
        leadScore: score,
        intentLevel: body.intentLevel ?? null,
        status: leadStatus,
        painPoints,
        suggestedAngle: body.suggestedAngle ?? null,
        aiSummary,
        assignedUser: body.assignedUser ?? null,
        duplicateKey,
        isDuplicate: false,
        rawData: Object.keys(rawData).length > 0 ? rawData : undefined,
        lastSeenAt: new Date(),
      })
      .returning();

    return c.json({
      success: true,
      status: 'created',
      leadId: row.id,
      isDuplicate: false,
      shouldSendToSlack,
      message: 'Lead created successfully',
    }, 201);
  } catch (err) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
});

leadsRouter.put('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const parsed = updateLeadSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid lead data', details: parsed.error.flatten().fieldErrors },
      }, 400);
    }

    const [existing] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } }, 404);
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.contactName !== undefined) updateData.contactName = data.contactName;
    if (data.product !== undefined) updateData.product = data.product;
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.market !== undefined) updateData.market = data.market;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.sourceUrl !== undefined) updateData.sourceUrl = data.sourceUrl;
    if (data.leadScore !== undefined) updateData.leadScore = data.leadScore;
    if (data.intentLevel !== undefined) updateData.intentLevel = data.intentLevel;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.painPoints !== undefined) updateData.painPoints = data.painPoints;
    if (data.suggestedAngle !== undefined) updateData.suggestedAngle = data.suggestedAngle;
    if (data.aiSummary !== undefined) updateData.aiSummary = data.aiSummary;
    if (data.assignedUser !== undefined) updateData.assignedUser = data.assignedUser;

    const [updated] = await db
      .update(leads)
      .set(updateData as any)
      .where(eq(leads.id, id))
      .returning();

    return c.json({
      success: true,
      data: {
        id: updated.id,
        companyName: updated.companyName,
        product: updated.product,
        status: updated.status,
        leadScore: updated.leadScore,
        assignedUser: updated.assignedUser,
        updatedAt: iso(updated.updatedAt)!,
      },
    });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

leadsRouter.delete('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');

    const [existing] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } }, 404);
    }

    await db.delete(leads).where(eq(leads.id, id));

    return c.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

export { leadsRouter };
