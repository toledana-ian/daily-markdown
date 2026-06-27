import { sql } from 'drizzle-orm';
import { customType, pgTable, uuid, text, timestamp, boolean, index, pgPolicy } from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

export const notes = pgTable(
  'notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    content: text('content').notNull(),
    search: tsvector('search').generatedAlwaysAs(
      sql`to_tsvector('english', coalesce("content", ''))`,
    ),
    isPinned: boolean('is_pinned').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('notes_user_id_idx').on(t.userId),
    index('notes_search_idx').using('gin', t.search),

    pgPolicy('notes_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${t.userId}`,
    }),

    pgPolicy('notes_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(select auth.uid()) = ${t.userId}`,
    }),

    pgPolicy('notes_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${t.userId}`,
      withCheck: sql`(select auth.uid()) = ${t.userId}`,
    }),

    pgPolicy('notes_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${t.userId}`,
    }),
  ],
);
