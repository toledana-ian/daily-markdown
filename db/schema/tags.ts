import { sql } from 'drizzle-orm';
import {
  index,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';
import { notes } from './notes';

export const tags = pgTable(
  'tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('tags_name_idx').on(t.name),

    pgPolicy('tags_select_all', {
      for: 'select',
      to: authenticatedRole,
      using: sql`true`,
    }),

    pgPolicy('tags_insert_all', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`true`,
    }),
  ],
);

export const noteTags = pgTable(
  'note_tags',
  {
    noteId: uuid('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.noteId, t.tagId], name: 'note_tags_note_id_tag_id_pk' }),
    index('note_tags_user_id_idx').on(t.userId),
    index('note_tags_note_id_idx').on(t.noteId),
    index('note_tags_tag_id_idx').on(t.tagId),

    pgPolicy('note_tags_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${t.userId}`,
    }),

    pgPolicy('note_tags_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(select auth.uid()) = ${t.userId}`,
    }),

    pgPolicy('note_tags_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${t.userId}`,
    }),
  ],
);
