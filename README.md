# daily-markdown

A daily markdown journaling app — write your notes in Markdown, organized by day.

**Try it out: [daily-md.christiantoledana.com](https://daily-md.christiantoledana.com/)**

## Features

- Write and edit daily notes in Markdown
- Notes are organized by date
- Sign in with your account to sync notes across devices
- Clean, distraction-free editing experience

### Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build) + **SWC** (Fast Refresh)
- **TanStack Router** (file-based routing)
- **Supabase** (auth + database)
- **Hono** (Cloudflare Worker server)
- **Wrangler** (Cloudflare deployment)
- **Tailwind CSS v4** + **shadcn/ui** + **Base UI**
- **Zustand** (client state)
- **Vitest** + **Testing Library** (tests)
- **Storybook** (component development)
- **Lefthook** (git hooks)

### Architecture

Monorepo: Bun Workspaces
```
daily-markdown/
├─ apps/
│  ├─ web/          React 19 + Vite + TanStack Router + TanStack Query
│  └─ api/          Hono (with Hono RPC) on Cloudflare Workers + Drizzle ORM
├─ packages/
│  └─ shared/       Zod schemas shared between web and api
└─ supabase/        Postgres + Auth + Storage + Realtime
```

Deploy: Cloudflare Pages (web) + Cloudflare Workers (api)

### Getting Started

```bash
bun install
bun run dev
```

### Environment Variables

| Variable | Description |
| -------- | ----------- |
| `DATABASE_URL` | Postgres connection string for the API |
| `VITE_MAX_FILE_UPLOAD_SIZE_BYTES` | Max client-side upload size in bytes (default: `10485760` / 10 MB) |

### Scripts

| Command | Description |
| ------- | ----------- |
| `bun run dev` | Start Wrangler, Vite, and Storybook |
| `bun run build` | Type-check and build for production |
| `bun run preview` | Build and run via Wrangler locally |
| `bun run deploy` | Build and deploy to Cloudflare |
| `bun run storybook` | Start Storybook dev server (port 6006) |
| `bun run build-storybook` | Build Storybook static site |
| `bun run test` | Run tests in watch mode |
| `bun run test:run` | Run tests once |
| `bun run lint` | Run ESLint |
| `bun run format` | Format with Prettier |
| `bun run format:check` | Check formatting without writing |

### File Structure

```text
daily-markdown/
├─ apps/
│  ├─ web/
│  │  ├─ public/
│  │  └─ src/
│  │     ├─ app/
│  │     │  ├─ layouts/
│  │     │  ├─ providers/
│  │     │  ├─ router/
│  │     │  └─ index.tsx
│  │     ├─ components/
│  │     │  ├─ ui/
│  │     │  ├─ common/
│  │     │  └─ layout/
│  │     ├─ features/
│  │     │  ├─ auth/
│  │     │  ├─ notes/
│  │     │  └─ marketing/
│  │     ├─ lib/
│  │     │  ├─ api/
│  │     │  ├─ supabase/
│  │     │  ├─ env.ts
│  │     │  └─ utils.ts
│  │     └─ routes/
│  │        ├─ __root.tsx
│  │        ├─ _public/
│  │        ├─ _auth/
│  │        └─ _app/
│  └─ api/
│     └─ src/
│        ├─ app.ts
│        ├─ middleware/
│        ├─ modules/
│        │  ├─ auth/
│        │  ├─ notes/
│        │  └─ webhooks/
│        └─ db/
│           ├─ schema/
│           └─ migrations/
├─ packages/
│  └─ shared/
│     └─ src/
│        ├─ schemas/
│        ├─ contracts/
│        ├─ types/
│        └─ constants/
├─ supabase/
├─ docs/
├─ package.json
├─ bun.lockb
└─ README.md
```
