import { Hono } from 'hono';
import type { Env } from '../../env';

const notes = new Hono<{ Bindings: Env }>();

// TODO: add notes CRUD routes

export default notes;
