import { Hono } from 'hono';
import { z } from 'zod';
import { createDbClient, tenants, permissions } from '@hivemind/db';
import { eq, and, inArray } from 'drizzle-orm';

const tenantsRouter = new Hono();

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  return createDbClient(url);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const createTenantSchema = z.object({
  name: z.string().min(1).max(100),
});

tenantsRouter.get('/', async (c) => {
  const auth = c.get('auth') as { type: string; sub?: string };
  const sub = auth?.sub;
  if (!sub) {
    return c.json({ tenants: [] });
  }

  const db = getDb();

  const userPermissions = await db
    .select({ tenantId: permissions.tenantId, role: permissions.role })
    .from(permissions)
    .where(
      and(
        eq(permissions.principalType, 'user'),
        eq(permissions.principalId, sub),
        eq(permissions.resourceType, 'tenant')
      )
    );

  if (userPermissions.length === 0) {
    return c.json({ tenants: [] });
  }

  const tenantIds = userPermissions.map((p) => p.tenantId);
  const userTenants = await db
    .select()
    .from(tenants)
    .where(inArray(tenants.id, tenantIds));

  const roleMap = new Map(userPermissions.map((p: { tenantId: string; role: string }) => [p.tenantId, p.role]));
  const result = userTenants.map((t: typeof tenants.$inferSelect & { role?: string }) => ({
    ...t,
    role: roleMap.get(t.id) || 'member',
  }));

  return c.json(result);
});

tenantsRouter.post('/', async (c) => {
  const auth = c.get('auth') as { type: string; sub?: string };
  const sub = auth?.sub;
  if (!sub) {
    return c.json({ code: 'UNAUTHORIZED', message: 'User identity not found in token' }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const parsed = createTenantSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request',
      details: parsed.error.flatten().fieldErrors,
    }, 400);
  }

  const { name } = parsed.data;
  const slug = slugify(name);

  const db = getDb();

  const existing = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    return c.json({
      code: 'CONFLICT',
      message: 'An organization with this name already exists',
    }, 409);
  }

  const [tenant] = await db
    .insert(tenants)
    .values({ name, slug })
    .returning();

  await db.insert(permissions).values({
    tenantId: tenant.id,
    resourceType: 'tenant',
    resourceId: tenant.id,
    principalType: 'user',
    principalId: sub,
    role: 'admin',
  });

  return c.json({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    status: tenant.status,
    role: 'admin',
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  }, 201);
});

export { tenantsRouter };
