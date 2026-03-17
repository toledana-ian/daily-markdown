import { Hono } from 'hono';
import type { Env } from './env';
import health from './modules/health/router';
import auth from './modules/auth/router';
import notes from './modules/notes/router';
import webhooks from './modules/webhooks/router';
import { corsMiddleware } from './middleware/cors';

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', corsMiddleware);

app.route('/api/health', health);
app.route('/api/auth', auth);
app.route('/api/notes', notes);
app.route('/api/webhooks', webhooks);

// Fall through to static assets (SPA)
app.all('*', (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
