import { Hono } from 'hono'

type Env = {
  ASSETS: Fetcher
}

const app = new Hono<{ Bindings: Env }>()

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello World' })
})

// Fall through to static assets for everything else
app.all('*', (c) => {
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app
