import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { createDbClient, invoices, invoiceItems } from '@hivemind/db';
import { createInvoiceSchema, updateInvoiceSchema } from '@hivemind/shared';

const invoicesRouter = new Hono();

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

async function getInvoiceWithItems(db: any, invoiceId: string, tenantId: string) {
  const [inv] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)))
    .limit(1);

  if (!inv) return null;

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId))
    .orderBy(invoiceItems.createdAt);

  return {
    id: inv.id,
    tenantId: inv.tenantId,
    type: inv.type,
    number: inv.number,
    status: inv.status,
    date: inv.date,
    dueDate: inv.dueDate,
    clientName: inv.clientName,
    clientEmail: inv.clientEmail,
    clientAddress: inv.clientAddress,
    companyName: inv.companyName,
    items: items.map((i: any) => ({
      id: i.id,
      invoiceId: i.invoiceId,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      amount: i.amount,
    })),
    subtotal: inv.subtotal,
    taxRate: inv.taxRate,
    taxAmount: inv.taxAmount,
    total: inv.total,
    notes: inv.notes,
    paymentType: inv.paymentType,
    amountPaid: inv.amountPaid,
    relatedInvoiceId: inv.relatedInvoiceId,
    createdAt: iso(inv.createdAt)!,
    updatedAt: iso(inv.updatedAt)!,
  };
}

invoicesRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const type = c.req.query('type');
    const status = c.req.query('status');
    const search = c.req.query('search');
    const limit = Math.min(Number(c.req.query('limit')) || 50, 200);
    const offset = Number(c.req.query('offset')) || 0;

    const conditions: any[] = [eq(invoices.tenantId, tenantId)];
    if (type) conditions.push(eq(invoices.type, type));
    if (status) conditions.push(eq(invoices.status, status));
    if (search) conditions.push(sql`${invoices.clientName} ILIKE ${'%' + search + '%'}`);

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoices)
      .where(and(...conditions));

    const rows = await db
      .select()
      .from(invoices)
      .where(and(...conditions))
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    const items = await Promise.all(rows.map((r: any) => getInvoiceWithItems(db, r.id, tenantId)));

    return c.json({ success: true, data: items, total: totalResult?.count ?? 0, limit, offset });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

invoicesRouter.get('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');

    const result = await getInvoiceWithItems(db, id, tenantId);
    if (!result) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } }, 404);
    }

    return c.json({ success: true, data: result });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

invoicesRouter.post('/', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const body = await c.req.json().catch(() => ({}));
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid invoice data', details: parsed.error.flatten().fieldErrors },
      }, 400);
    }

    const data = parsed.data;

    const [inv] = await db
      .insert(invoices)
      .values({
        tenantId,
        type: data.type,
        number: data.number,
        status: data.status ?? 'draft',
        date: data.date,
        dueDate: data.dueDate,
        clientName: data.clientName,
        clientEmail: data.clientEmail ?? null,
        clientAddress: data.clientAddress ?? null,
        companyName: data.companyName ?? null,
        subtotal: String(data.subtotal),
        taxRate: String(data.taxRate ?? 0),
        taxAmount: String(data.taxAmount ?? 0),
        total: String(data.total),
        notes: data.notes ?? null,
        paymentType: data.paymentType ?? null,
        amountPaid: data.amountPaid ? String(data.amountPaid) : null,
        relatedInvoiceId: data.relatedInvoiceId ?? null,
      })
      .returning();

    if (data.items && data.items.length > 0) {
      await db.insert(invoiceItems).values(
        data.items.map((item: any) => ({
          invoiceId: inv.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          amount: String(item.amount),
        })),
      );
    }

    const result = await getInvoiceWithItems(db, inv.id, tenantId);
    return c.json({ success: true, data: result }, 201);
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

invoicesRouter.put('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const parsed = updateInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid invoice data', details: parsed.error.flatten().fieldErrors },
      }, 400);
    }

    const [existing] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } }, 404);
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.type !== undefined) updateData.type = data.type;
    if (data.number !== undefined) updateData.number = data.number;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.clientName !== undefined) updateData.clientName = data.clientName;
    if (data.clientEmail !== undefined) updateData.clientEmail = data.clientEmail;
    if (data.clientAddress !== undefined) updateData.clientAddress = data.clientAddress;
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.subtotal !== undefined) updateData.subtotal = String(data.subtotal);
    if (data.taxRate !== undefined) updateData.taxRate = String(data.taxRate);
    if (data.taxAmount !== undefined) updateData.taxAmount = String(data.taxAmount);
    if (data.total !== undefined) updateData.total = String(data.total);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.paymentType !== undefined) updateData.paymentType = data.paymentType;
    if (data.amountPaid !== undefined) updateData.amountPaid = String(data.amountPaid);
    if (data.relatedInvoiceId !== undefined) updateData.relatedInvoiceId = data.relatedInvoiceId;

    await db.update(invoices).set(updateData as any).where(eq(invoices.id, id));

    if (data.items) {
      await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
      await db.insert(invoiceItems).values(
        data.items.map((item: any) => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          amount: String(item.amount),
        })),
      );
    }

    const result = await getInvoiceWithItems(db, id, tenantId);
    return c.json({ success: true, data: result });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

invoicesRouter.delete('/:id', async (c) => {
  try {
    const db = getDb();
    const tenantId = getTenantId(c);
    const id = c.req.param('id');

    const [existing] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } }, 404);
    }

    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    await db.delete(invoices).where(eq(invoices.id, id));
    return c.json({ success: true, message: 'Invoice deleted' });
  } catch (err) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unknown error' } }, 500);
  }
});

export { invoicesRouter };
