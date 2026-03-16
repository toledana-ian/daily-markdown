import { Hono } from 'hono';
import type { Env } from './types';
import health from './routes/health';
import auth from './routes/auth';
import notes from './routes/notes';
import webhooks from './routes/webhooks';
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
