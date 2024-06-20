import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const memos = sqliteTable('memos', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  title: text('title'),
  content: text('content'),
});