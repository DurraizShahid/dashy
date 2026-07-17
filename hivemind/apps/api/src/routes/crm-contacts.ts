import { Hono } from 'hono';
import { eq, and, desc, like, sql, or } from 'drizzle-orm';
import { createDbClient, contacts } from '@hivemind/db';
import { createContactSchema, updateContactSchema } from '@hivemind/shared';

const contactsRouter = new Hono();

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

contactsRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const search = c.req.query('search');
    const companyId = c.req.query('companyId');
    const source = c.req.query('source');
    const limit = Math.min(Number(c.req.query('limit')) || 50, 200);
    const offset = Number(c.req.query('offset')) || 0;

    const conditions: any[] = [eq(contacts.tenantId, tenantId)];
    if (companyId) conditions.push(eq(contacts.companyId, companyId));
    if (source) conditions.push(eq(contacts.source, source));
    if (search) {
      conditions.push(
        or(
          like(contacts.fullName, `%${search}%`),
          like(contacts.email, `%${search}%`),
          like(contacts.companyName, `%${search}%`),
        ),
      );
    }

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contacts)
      .where(and(...conditions));

    const rows = await db
      .select()
      .from(contacts)
      .where(and(...conditions))
      .orderBy(desc(contacts.createdAt))
      .limit(limit)
      .offset(offset);

    const items = rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      companyId: r.companyId,
      companyName: r.companyName,
      fullName: r.fullName,
      jobTitle: r.jobTitle,
      email: r.email,
      phone: r.phone,
      linkedInUrl: r.linkedInUrl,
      country: r.country,
      source: r.source,
      status: r.status,
      createdAt: iso(r.createdAt)!,
      updatedAt: iso(r.updatedAt)!,
    }));

    return c.json({ success: true, data: items, total: totalResult?.count ?? 0, limit, offset });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

contactsRouter.get('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');

    const [row] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)))
      .limit(1);

    if (!row) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } }, 404);
    }

    return c.json({ success: true, data: { ...row, createdAt: iso(row.createdAt)!, updatedAt: iso(row.updatedAt)! } });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

contactsRouter.post('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const body = await c.req.json().catch(() => ({}));
    const parsed = createContactSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid contact data', details: parsed.error.flatten().fieldErrors },
      }, 400);
    }

    const data = parsed.data;

    const [row] = await db
      .insert(contacts)
      .values({
        tenantId,
        companyId: data.companyId ?? null,
        companyName: data.companyName ?? null,
        fullName: data.fullName,
        jobTitle: data.jobTitle ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        linkedInUrl: data.linkedInUrl ?? null,
        country: data.country ?? null,
        source: data.source ?? null,
        status: data.status ?? 'Active',
      })
      .returning();

    return c.json({ success: true, data: { id: row.id, fullName: row.fullName, createdAt: iso(row.createdAt)! } }, 201);
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

contactsRouter.put('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const parsed = updateContactSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid contact data', details: parsed.error.flatten().fieldErrors },
      }, 400);
    }

    const [existing] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } }, 404);
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.companyId !== undefined) updateData.companyId = data.companyId;
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.linkedInUrl !== undefined) updateData.linkedInUrl = data.linkedInUrl;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.status !== undefined) updateData.status = data.status;

    const [updated] = await db
      .update(contacts)
      .set(updateData as any)
      .where(eq(contacts.id, id))
      .returning();

    return c.json({ success: true, data: { id: updated.id, fullName: updated.fullName, updatedAt: iso(updated.updatedAt)! } });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

contactsRouter.delete('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');

    const [existing] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } }, 404);
    }

    await db.delete(contacts).where(eq(contacts.id, id));
    return c.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

export { contactsRouter };
