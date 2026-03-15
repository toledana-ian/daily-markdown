import { Hono } from 'hono'
import type { Env } from '../types'

const health = new Hono<{ Bindings: Env }>()

health.get('/', (c) => {
  return c.json({ status: 'ok' })
})

export default health
