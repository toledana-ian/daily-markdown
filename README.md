# daily-markdown

A daily Markdown journaling app.

I created this app because my notes in Google Keep and Apple Notes started feeling too cluttered. I constantly create new notes for random ideas, GitHub PR drafts, quick restaurant lists, temporary checklists, and development snippets; and eventually everything becomes hard to organize.

This app solves that by organizing notes by day, where only today’s notes are shown by default. Every day feels like a fresh blank canvas where you can freely write as much as you want without seeing yesterday’s clutter.

When you want to revisit older notes, you can simply click a date from the calendar sidebar to instantly view everything you wrote on that day.

Built with developers in mind, it includes powerful editor features commonly found in code editors:
- Multi-line editing
- Find & replace
- Regex search
- Keyboard-first workflows

It also supports quick slash commands like:
- `/table`
- `/link`
- `/warning`

to instantly generate Markdown templates while writing.

You can drag and drop files directly into the editor, and they’ll automatically upload (up to 10MB per file).

Tags are created automatically using `#TagName`, making it easy to organize and quickly find related notes from the sidebar.

And because everything is written in pure Markdown, you can copy content directly into GitHub, PR descriptions, documentation, or README files with the same formatting preserved.

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
