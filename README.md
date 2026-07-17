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

You can drag and drop files into the editor, or paste images and files from your clipboard, and they’ll automatically upload to storage (up to 10MB per file).

Use **Quick Search** in the sidebar to save search terms you use often and jump back to related notes with one click.

And because everything is written in pure Markdown, you can copy content directly into GitHub, PR descriptions, documentation, or README files with the same formatting preserved.

**Try it out: [daily-md.christiantoledana.com](https://daily-md.christiantoledana.com/)**

## Features

- Write and edit daily notes in Markdown
- Notes are organized by date, with a calendar sidebar for browsing past days
- Sign in with your account to sync notes across devices
- Full-text search across note content
- **Quick Search** — save, reorder, and one-click common search terms in the sidebar
- **File uploads in the editor** — drag and drop files, or paste from the clipboard; images and other files upload to Supabase Storage and insert as Markdown links
- Clean, distraction-free editing experience with CodeMirror
- PWA support for installable, offline-friendly use

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build) + **SWC** (Fast Refresh)
- **TanStack Router** (file-based routing)
- **TanStack Query** (server state)
- **Supabase** (auth, Postgres, storage) — accessed directly from the browser
- **Drizzle ORM** + **drizzle-kit** (schema and migrations)
- **CodeMirror** (Markdown editor)
- **Tailwind CSS v4** + **shadcn/ui** + **Base UI**
- **Zustand** (client state)
- **Vitest** + **Testing Library** (tests)
- **Wrangler** (Cloudflare static asset deployment)
- **Lefthook** (git hooks)

## Architecture

This is a single **React + Vite** SPA — not a monorepo. There is no separate API server; the app talks to **Supabase** directly via `@supabase/supabase-js`.

```
Browser (React SPA)
  │
  ├─ TanStack Router   → file-based routes (public, auth, app)
  ├─ TanStack Query    → cached Supabase reads
  ├─ Zustand           → UI state (sidebar, calendar, search)
  └─ Supabase client   → auth, Postgres (notes, quick_search_items), storage (note-images)
```

**Data flow**

1. **Auth** — Google OAuth through Supabase Auth; the session is stored client-side and attached to every Supabase request.
2. **Notes** — Stored in Postgres with row-level security (RLS). Each user can only read and write their own rows. Full-text search uses a generated `tsvector` column on note content.
3. **Quick Search** — Saved search terms live in the `quick_search_items` table (per user, with sort order). Clicking an item fills the sidebar search bar and filters notes across all dates.
4. **File uploads** — Files are uploaded from the editor to the `note-images` Supabase Storage bucket (scoped per user). Images get public URLs; non-image files get a file-icon thumbnail. Migration `0004_note_images_storage.sql` creates the bucket and storage policies.
5. **Schema changes** — Defined in `db/schema/` with Drizzle, versioned in `db/migrations/`, and applied with `bun run db:migrate` against your Postgres database.

**Deploy**

Production builds output static assets to `dist/`. [Wrangler](https://developers.cloudflare.com/workers/static-assets/) serves them as a single-page application on Cloudflare (`wrangler.jsonc`).

```
daily-markdown/
├── db/
│   ├── schema/              # Drizzle table definitions + RLS policies
│   └── migrations/          # Generated SQL migrations
├── public/
├── src/
│   ├── app/                 # Layouts and providers
│   ├── components/          # Shared UI (shadcn) and common components
│   ├── features/            # Feature modules (auth, notes, calendar, quick-search, …)
│   ├── lib/                 # Supabase client, utilities
│   └── routes/              # TanStack Router file-based routes
├── supabase/                # Supabase CLI configuration
├── drizzle.config.ts
├── wrangler.jsonc
└── package.json
```

## Getting Started

```bash
bun install
bun run dev
```

The dev server starts at [http://localhost:5173](http://localhost:5173).

## Environment Variables

Create a `.env.local` file in the project root (it is gitignored). Drizzle reads `.env` first, then `.env.local` overrides it.

### For local development (Vite)

| Variable                           | Required | Description                                            |
| ---------------------------------- | -------- | ------------------------------------------------------ |
| `VITE_SUPABASE_URL`                | Yes      | Your Supabase project URL                              |
| `VITE_SUPABASE_PUBLISHABLE_KEY`    | Yes      | Supabase publishable (anon) key                        |
| `VITE_MAX_FILE_UPLOAD_SIZE_BYTES`  | No       | Max upload size in bytes (default: `10485760` / 10 MB) |
| `VITE_SUPABASE_NOTE_IMAGES_BUCKET` | No       | Storage bucket name (default: `note-images`)           |

### For database migrations (Drizzle)

| Variable       | Required | Description                                           |
| -------------- | -------- | ----------------------------------------------------- |
| `DATABASE_URL` | Yes      | Postgres connection string for your Supabase database |

Put `DATABASE_URL` in `.env.local` so you can run migrations against your own database:

```bash
# .env.local
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Then apply the schema:

```bash
bun run db:migrate
```

To create a new migration after changing `db/schema/`:

```bash
bun run db:generate <migration-name>
```

## Setting Up Supabase

### 1. Create a project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the database to finish provisioning.

### 2. Get API credentials

In **Project Settings → API**, copy:

- **Project URL** → `VITE_SUPABASE_URL`
- **Publishable key** (anon key) → `VITE_SUPABASE_PUBLISHABLE_KEY`

### 3. Get the database connection string

In **Project Settings → Database → Connection string**, choose **URI** and copy the connection string. Use the **Session pooler** (port `6543`) or **Direct** connection. Replace `[YOUR-PASSWORD]` with your database password.

Set this as `DATABASE_URL` in `.env.local`.

### 4. Run migrations

```bash
bun run db:migrate
```

This creates the `notes` and `quick_search_items` tables, enables RLS policies, sets up full-text search, and creates the `note-images` storage bucket with upload policies.

### 5. Enable Google sign-in

1. In Supabase, go to **Authentication → Providers → Google** and enable it.
2. Follow Supabase’s guide to create Google OAuth credentials and paste the Client ID and Secret.
3. Under **Authentication → URL Configuration**, add these **Redirect URLs**:
   - `http://localhost:5173/auth/callback` (local dev)
   - `https://your-production-domain/auth/callback` (production)

The app uses `signInWithOAuth` with `redirectTo: /auth/callback`.

### 6. Verify storage (optional)

In **Storage**, confirm the `note-images` bucket exists after migration. It is public for reads; uploads are restricted to authenticated users into their own folder (`{userId}/…`).

## Scripts

| Command                      | Description                                  |
| ---------------------------- | -------------------------------------------- |
| `bun run dev`                | Start the Vite dev server                    |
| `bun run build`              | Type-check and build for production          |
| `bun run preview`            | Preview the production build locally         |
| `bun run deploy`             | Build and deploy static assets to Cloudflare |
| `bun run db:migrate`         | Apply Drizzle migrations to your database    |
| `bun run db:generate <name>` | Generate a new migration from schema changes |
| `bun run test`               | Run tests in watch mode                      |
| `bun run test:run`           | Run tests once                               |
| `bun run lint`               | Run ESLint                                   |
| `bun run format`             | Format with Prettier                         |
| `bun run format:check`       | Check formatting without writing             |

---

Thank you for checking out daily-markdown — whether you’re using it, self-hosting it, or just browsing the code. I hope it helps you write a little more clearly, one day at a time.
