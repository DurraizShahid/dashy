import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { createDbClient, crmSettings } from '@hivemind/db';
import { createCrmSettingsSchema } from '@hivemind/shared';

const settingsRouter = new Hono();

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

settingsRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const key = c.req.query('key');

    const conditions: any[] = [eq(crmSettings.tenantId, tenantId)];
    if (key) conditions.push(eq(crmSettings.key, key));

    const rows = await db
      .select()
      .from(crmSettings)
      .where(and(...conditions));

    const items = rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      key: r.key,
      value: r.value,
      createdAt: iso(r.createdAt)!,
      updatedAt: iso(r.updatedAt)!,
    }));

    return c.json({ success: true, data: items });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

settingsRouter.get('/:key', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const key = c.req.param('key');

    const [row] = await db
      .select()
      .from(crmSettings)
      .where(and(eq(crmSettings.tenantId, tenantId), eq(crmSettings.key, key)))
      .limit(1);

    if (!row) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Setting not found' } }, 404);
    }

    return c.json({
      success: true,
      data: {
        id: row.id,
        tenantId: row.tenantId,
        key: row.key,
        value: row.value,
        createdAt: iso(row.createdAt)!,
        updatedAt: iso(row.updatedAt)!,
      },
    });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

settingsRouter.put('/:key', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const key = c.req.param('key');
    const body = await c.req.json().catch(() => ({}));
    const parsed = createCrmSettingsSchema.safeParse({ key, ...body });

    if (!parsed.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid setting data', details: parsed.error.flatten().fieldErrors },
      }, 400);
    }

    const [existing] = await db
      .select()
      .from(crmSettings)
      .where(and(eq(crmSettings.tenantId, tenantId), eq(crmSettings.key, key)))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(crmSettings)
        .set({ value: parsed.data.value, updatedAt: new Date() })
        .where(eq(crmSettings.id, existing.id))
        .returning();

      return c.json({
        success: true,
        data: {
          id: updated.id,
          key: updated.key,
          value: updated.value,
          updatedAt: iso(updated.updatedAt)!,
        },
      });
    }

    const [created] = await db
      .insert(crmSettings)
      .values({ tenantId, key, value: parsed.data.value })
      .returning();

    return c.json({
      success: true,
      data: {
        id: created.id,
        key: created.key,
        value: created.value,
        createdAt: iso(created.createdAt)!,
      },
    }, 201);
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

settingsRouter.delete('/:key', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const key = c.req.param('key');

    const [existing] = await db
      .select()
      .from(crmSettings)
      .where(and(eq(crmSettings.tenantId, tenantId), eq(crmSettings.key, key)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Setting not found' } }, 404);
    }

    await db.delete(crmSettings).where(eq(crmSettings.id, existing.id));
    return c.json({ success: true, message: 'Setting deleted' });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

export { settingsRouter };
