import { Hono } from 'hono';
import { validateEnv, createLogger, getLogger } from '@hivemind/core';
import { requestIdMiddleware, corsMiddleware, authMiddleware, errorHandler } from './middleware';
import { indexRouter } from './routes';
import { healthRouter } from './routes/health';
import { versionRouter } from './routes/version';
import { registryRouter } from './routes/service-registry';
import { agentRouter } from './routes/agent';
import { ingestRouter } from './routes/ingest';
import { tenantsRouter } from './routes/tenants';
import { meRouter } from './routes/me';
import { leadsRouter } from './routes/crm-leads';
import { companiesRouter } from './routes/crm-companies';
import { contactsRouter } from './routes/crm-contacts';
import { invoicesRouter } from './routes/crm-invoices';
import { sourcesRouter } from './routes/crm-sources';
import { notificationsRouter } from './routes/crm-notifications';
import { settingsRouter } from './routes/crm-settings';
import { API_PREFIX } from '@hivemind/shared';

export function createApp() {
  const env = validateEnv();
  const logger = createLogger('hivemind-api');

  const app = new Hono();

  app.use('*', requestIdMiddleware());
  app.use('*', corsMiddleware());
  app.use('*', errorHandler());
  app.use(`${API_PREFIX}/*`, authMiddleware(env));

  app.route('/', indexRouter);
  app.route('/health', healthRouter);
  app.route(`${API_PREFIX}/version`, versionRouter);
  app.route(`${API_PREFIX}/service-registry`, registryRouter);
  app.route(`${API_PREFIX}/agent`, agentRouter);
  app.route(`${API_PREFIX}/ingest`, ingestRouter);
  app.route(`${API_PREFIX}/me`, meRouter);
  app.route(`${API_PREFIX}/tenants`, tenantsRouter);

  // CRM routes
  app.route(`${API_PREFIX}/crm/leads`, leadsRouter);
  app.route(`${API_PREFIX}/crm/companies`, companiesRouter);
  app.route(`${API_PREFIX}/crm/contacts`, contactsRouter);
  app.route(`${API_PREFIX}/crm/invoices`, invoicesRouter);
  app.route(`${API_PREFIX}/crm/sources`, sourcesRouter);
  app.route(`${API_PREFIX}/crm/notifications`, notificationsRouter);
  app.route(`${API_PREFIX}/crm/settings`, settingsRouter);

  app.notFound((c) => c.json({ code: 'NOT_FOUND', message: `Route not found: ${c.req.method} ${c.req.path}` }, 404));

  return { app, env, logger };
}
