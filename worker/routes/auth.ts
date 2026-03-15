import { Hono } from 'hono'
import type { Env } from '../types'

const auth = new Hono<{ Bindings: Env }>()

// TODO: add auth routes (e.g. /session, /logout)

export default auth
