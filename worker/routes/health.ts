import { Hono } from 'hono'
import type { Env } from '../types'

const health = new Hono<{ Bindings: Env }>()

health.get('/', (c) => {
  console.log('Health check requested')
  return c.json({ status: 'ok', message: 'Service is healthy' })
})

export default health
