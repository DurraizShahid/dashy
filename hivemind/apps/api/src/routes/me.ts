import { Hono } from 'hono';

const meRouter = new Hono();

meRouter.get('/', async (c) => {
  const auth = c.get('auth') as {
    type: string;
    sub?: string;
    email?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
  };

  if (!auth?.sub) {
    return c.json({ code: 'UNAUTHORIZED', message: 'User identity not found in token' }, 401);
  }

  const name = [auth.given_name, auth.family_name].filter(Boolean).join(' ') || auth.preferred_username || '';

  return c.json({
    id: auth.sub,
    email: auth.email || '',
    name,
    actorType: 'user',
    createdAt: new Date().toISOString(),
  });
});

export { meRouter };
