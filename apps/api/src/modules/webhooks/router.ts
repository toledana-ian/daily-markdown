import { Hono } from 'hono';
import type { Env } from '../../env';

const webhooks = new Hono<{ Bindings: Env }>();

// TODO: add webhook handler routes

export default webhooks;
