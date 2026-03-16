import { Hono } from 'hono';
import type { Env } from '../types';

const health = new Hono<{ Bindings: Env }>();

health.get('/', (c) => {
  console.log('Health check requested');
  return c.json({ status: 'ok', message: 'Service is healthy' });
});

health.get('/env', (c) => {
  console.log('Health check requested');
  return c.json({ status: 'ok', data: process.env });
});

export default health;
