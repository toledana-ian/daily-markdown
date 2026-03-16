import { Hono } from 'hono';
import type { Env } from '../types';

const notes = new Hono<{ Bindings: Env }>();

// TODO: add notes CRUD routes

export default notes;
