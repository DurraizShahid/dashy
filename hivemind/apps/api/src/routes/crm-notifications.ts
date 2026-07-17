import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { createDbClient, crmNotifications } from '@hivemind/db';
import { createNotificationSchema, updateNotificationSchema } from '@hivemind/shared';

const notificationsRouter = new Hono();

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

notificationsRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);

    const rows = await db
      .select()
      .from(crmNotifications)
      .where(eq(crmNotifications.tenantId, tenantId))
      .orderBy(desc(crmNotifications.createdAt));

    const items = rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      channel: r.channel,
      type: r.type,
      enabled: r.enabled,
      config: r.config,
      createdAt: iso(r.createdAt)!,
      updatedAt: iso(r.updatedAt)!,
    }));

    return c.json({ success: true, data: items });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

notificationsRouter.post('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const body = await c.req.json().catch(() => ({}));
    const parsed = createNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid notification data', details: parsed.error.flatten().fieldErrors },
      }, 400);
    }

    const data = parsed.data;

    const [row] = await db
      .insert(crmNotifications)
      .values({
        tenantId,
        channel: data.channel,
        type: data.type,
        enabled: data.enabled ?? true,
        config: data.config ?? {},
      })
      .returning();

    return c.json({
      success: true,
      data: {
        id: row.id,
        channel: row.channel,
        type: row.type,
        enabled: row.enabled,
        createdAt: iso(row.createdAt)!,
      },
    }, 201);
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

notificationsRouter.put('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const parsed = updateNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid notification data', details: parsed.error.flatten().fieldErrors },
      }, 400);
    }

    const [existing] = await db
      .select()
      .from(crmNotifications)
      .where(and(eq(crmNotifications.id, id), eq(crmNotifications.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification rule not found' } }, 404);
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.channel !== undefined) updateData.channel = data.channel;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.config !== undefined) updateData.config = data.config;

    const [updated] = await db
      .update(crmNotifications)
      .set(updateData as any)
      .where(eq(crmNotifications.id, id))
      .returning();

    return c.json({
      success: true,
      data: {
        id: updated.id,
        channel: updated.channel,
        type: updated.type,
        enabled: updated.enabled,
        updatedAt: iso(updated.updatedAt)!,
      },
    });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

notificationsRouter.delete('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');

    const [existing] = await db
      .select()
      .from(crmNotifications)
      .where(and(eq(crmNotifications.id, id), eq(crmNotifications.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification rule not found' } }, 404);
    }

    await db.delete(crmNotifications).where(eq(crmNotifications.id, id));
    return c.json({ success: true, message: 'Notification rule deleted' });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

export { notificationsRouter };
