import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const memos = sqliteTable('memos', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  title: text('title'),
  content: text('content'),
});

export const oursession = sqliteTable('oursession', {
  id: text('id').notNull(),
  github_id: integer('github_id', { mode: 'number' }).primaryKey(),
  username: text('username'),
});

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => user.id),
  expires_at: integer('expires_at', { mode: 'timestamp' }),
  active_expires: integer('active_expires', { mode: 'timestamp' }).notNull(),
  idle_expires: integer('idle_expires', { mode: 'timestamp' }).notNull(),
});

export const key = sqliteTable('key', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => user.id),
  hashed_password: text('hashed_password'),
});
