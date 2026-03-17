# daily-markdown

A daily markdown journaling app built with React, TanStack Router, Supabase auth, and deployed to Cloudflare Workers.

## Tech Stack

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

## Getting Started

```bash
bun install
bun run dev
```

## Scripts

| Command                   | Description                            |
| ------------------------- | -------------------------------------- |
| `bun run dev`             | Start Wrangler, Vite, and Storybook    |
| `bun run build`           | Type-check and build for production    |
| `bun run preview`         | Build and run via Wrangler locally     |
| `bun run deploy`          | Build and deploy to Cloudflare         |
| `bun run storybook`       | Start Storybook dev server (port 6006) |
| `bun run build-storybook` | Build Storybook static site            |
| `bun run test`            | Run tests in watch mode                |
| `bun run test:run`        | Run tests once                         |
| `bun run lint`            | Run ESLint                             |
| `bun run format`          | Format with Prettier                   |
| `bun run format:check`    | Check formatting without writing       |

## Stack

Monorepo: Bun Workspaces  
│  
├── apps/web  
│ Frontend: React 19 + Vite 6 + TanStack Router + TanStack Query  
│ Styling: Tailwind v4 + shadcn/ui  
│ State: Zustand  
│ Forms: React Hook Form + Zod  
│  
├── apps/api  
│ API: Hono (with Hono RPC) on Cloudflare Workers  
│ ORM: Drizzle ORM + Cloudflare Hyperdrive  
│  
└── packages/shared  
Validation: Zod schemas (shared between web + api)  
│  
Database: Supabase (Postgres + Auth + Storage + Realtime)
Deploy: Cloudflare Pages (web) + Cloudflare Workers (api)  
Monitoring: Sentry  
│  
Pkg Mgr: Bun  
Lint: ESLint v9 + Prettier  
Git Hooks: Lefthook + lint-staged  
Testing: Vitest + Playwright  
Types: TypeScript 5.x strict  
DX: knip

## File Structure

```text
daily-markdown/
├─ apps/
│  ├─ web/
│  │  ├─ public/
│  │  ├─ src/
│  │  │  ├─ app/
│  │  │  │  ├─ layouts/
│  │  │  │  ├─ providers/
│  │  │  │  ├─ router/
│  │  │  │  └─ index.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ ui/
│  │  │  │  ├─ common/
│  │  │  │  └─ layout/
│  │  │  ├─ features/
│  │  │  │  ├─ auth/
│  │  │  │  │  ├─ api/
│  │  │  │  │  ├─ components/
│  │  │  │  │  ├─ hooks/
│  │  │  │  │  ├─ schemas/
│  │  │  │  │  ├─ store/
│  │  │  │  │  └─ login-screen.tsx
│  │  │  │  ├─ notes/
│  │  │  │  │  ├─ api/
│  │  │  │  │  ├─ components/
│  │  │  │  │  ├─ hooks/
│  │  │  │  │  ├─ schemas/
│  │  │  │  │  └─ notes-screen.tsx
│  │  │  │  └─ marketing/
│  │  │  ├─ lib/
│  │  │  │  ├─ api/
│  │  │  │  ├─ supabase/
│  │  │  │  ├─ env.ts
│  │  │  │  └─ utils.ts
│  │  │  ├─ routes/
│  │  │  │  ├─ __root.tsx
│  │  │  │  ├─ _public/
│  │  │  │  ├─ _auth/
│  │  │  │  └─ _app/
│  │  │  ├─ test/
│  │  │  ├─ index.css
│  │  │  ├─ main.tsx
│  │  │  └─ routeTree.gen.ts
│  │  ├─ components.json
│  │  ├─ vite.config.ts
│  │  └─ tsconfig.json
│  │
│  └─ api/
│     ├─ src/
│     │  ├─ app.ts
│     │  ├─ index.ts
│     │  ├─ env.ts
│     │  ├─ middleware/
│     │  ├─ modules/
│     │  │  ├─ auth/
│     │  │  ├─ notes/
│     │  │  └─ webhooks/
│     │  ├─ db/
│     │  │  ├─ client.ts
│     │  │  ├─ schema/
│     │  │  └─ migrations/
│     │  └─ lib/
│     ├─ wrangler.jsonc
│     └─ tsconfig.json
│
├─ packages/
│  └─ shared/
│     ├─ src/
│     │  ├─ schemas/
│     │  ├─ contracts/
│     │  ├─ types/
│     │  ├─ constants/
│     │  └─ index.ts
│     ├─ package.json
│     └─ tsconfig.json
│
├─ supabase/
├─ docs/
├─ package.json
├─ bun.lockb
├─ tsconfig.base.json
├─ eslint.config.js
├─ lefthook.yml
└─ README.md
```
