import { Hono } from 'hono';
import { eq, and, desc, like, sql, or } from 'drizzle-orm';
import { createDbClient, companies } from '@hivemind/db';
import { createCompanySchema, updateCompanySchema } from '@hivemind/shared';

const companiesRouter = new Hono();

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

companiesRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const search = c.req.query('search');
    const productFit = c.req.query('productFit');
    const limit = Math.min(Number(c.req.query('limit')) || 50, 200);
    const offset = Number(c.req.query('offset')) || 0;

    const conditions: any[] = [eq(companies.tenantId, tenantId)];
    if (productFit) conditions.push(eq(companies.productFit, productFit));
    if (search) {
      conditions.push(
        or(
          like(companies.name, `%${search}%`),
          like(companies.industry, `%${search}%`),
          like(companies.country, `%${search}%`),
        ),
      );
    }

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(companies)
      .where(and(...conditions));

    const rows = await db
      .select()
      .from(companies)
      .where(and(...conditions))
      .orderBy(desc(companies.createdAt))
      .limit(limit)
      .offset(offset);

    const items = rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      website: r.website,
      industry: r.industry,
      productFit: r.productFit,
      country: r.country,
      city: r.city,
      phone: r.phone,
      email: r.email,
      linkedInUrl: r.linkedInUrl,
      employeeCount: r.employeeCount,
      leadCount: r.leadCount,
      description: r.description,
      createdAt: iso(r.createdAt)!,
      updatedAt: iso(r.updatedAt)!,
    }));

    return c.json({ success: true, data: items, total: totalResult?.count ?? 0, limit, offset });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

companiesRouter.get('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');

    const [row] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)))
      .limit(1);

    if (!row) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } }, 404);
    }

    return c.json({
      success: true,
      data: {
        id: row.id,
        tenantId: row.tenantId,
        name: row.name,
        website: row.website,
        industry: row.industry,
        productFit: row.productFit,
        country: row.country,
        city: row.city,
        phone: row.phone,
        email: row.email,
        linkedInUrl: row.linkedInUrl,
        employeeCount: row.employeeCount,
        leadCount: row.leadCount,
        description: row.description,
        createdAt: iso(row.createdAt)!,
        updatedAt: iso(row.updatedAt)!,
      },
    });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

companiesRouter.post('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const body = await c.req.json().catch(() => ({}));
    const parsed = createCompanySchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid company data', details: parsed.error.flatten().fieldErrors },
      }, 400);
    }

    const data = parsed.data;

    const [row] = await db
      .insert(companies)
      .values({
        tenantId,
        name: data.name,
        website: data.website ?? null,
        industry: data.industry ?? null,
        productFit: data.productFit ?? null,
        country: data.country ?? null,
        city: data.city ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        linkedInUrl: data.linkedInUrl ?? null,
        employeeCount: data.employeeCount ?? null,
        leadCount: data.leadCount ?? 0,
        description: data.description ?? null,
      })
      .returning();

    return c.json({ success: true, data: { id: row.id, name: row.name, createdAt: iso(row.createdAt)! } }, 201);
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

companiesRouter.put('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const parsed = updateCompanySchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid company data', details: parsed.error.flatten().fieldErrors },
      }, 400);
    }

    const [existing] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } }, 404);
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.productFit !== undefined) updateData.productFit = data.productFit;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.linkedInUrl !== undefined) updateData.linkedInUrl = data.linkedInUrl;
    if (data.employeeCount !== undefined) updateData.employeeCount = data.employeeCount;
    if (data.description !== undefined) updateData.description = data.description;

    const [updated] = await db
      .update(companies)
      .set(updateData as any)
      .where(eq(companies.id, id))
      .returning();

    return c.json({ success: true, data: { id: updated.id, name: updated.name, updatedAt: iso(updated.updatedAt)! } });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

companiesRouter.delete('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');

    const [existing] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } }, 404);
    }

    await db.delete(companies).where(eq(companies.id, id));
    return c.json({ success: true, message: 'Company deleted' });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

export { companiesRouter };
