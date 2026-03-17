import { createMiddleware } from 'hono/factory';
import type { Env } from '../env';

export const authMiddleware = createMiddleware<{ Bindings: Env }>(async (_c, next) => {
  // TODO: validate Authorization header via Supabase JWT verification
  await next();
});
