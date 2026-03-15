import { Hono } from 'hono'
import type { Env } from '../types'

const webhooks = new Hono<{ Bindings: Env }>()

// TODO: add webhook handler routes

export default webhooks
