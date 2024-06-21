import { SQLiteTimestamp } from 'drizzle-orm/sqlite-core';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const memos = sqliteTable('memos', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  title: text('title'),
  content: text('content'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').notNull(),
  github_id: integer('github_id', { mode: 'number' }).primaryKey(),
  username: text('username'),
});

export const user = sqliteTable('user', {
  id: text('id').primaryKey().notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey().notNull(),
  user_id: text('user_id'),
  //user_id: text('user_id').references(() => user.id),
  active_expires: integer('active_expires', { mode: 'number' }),
  idle_expires: integer('idle_expires', { mode: 'number' }),
  expires_at: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const key = sqliteTable('key', {
  id: text('id').primaryKey().notNull(),
//  user_id: text('user_id').references(() => user.id),
  user_id: text('user_id'),
  hashed_password: text('hashed_password'),
});
