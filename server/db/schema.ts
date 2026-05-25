import { pgTable, uuid, varchar, integer, text, jsonb, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const surnames = pgTable('surnames', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 10 }).notNull(),
  pinyin: varchar('pinyin', { length: 50 }).notNull(),
  rank: integer('rank').notNull(),
  origin: text('origin').notNull(),
  ancestor: varchar('ancestor', { length: 100 }).notNull(),
  junwang: text('junwang').array().notNull().default([]),
  tanghao: varchar('tanghao', { length: 200 }).notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  nameIdx: uniqueIndex('surname_name_idx').on(table.name),
  pinyinIdx: index('surname_pinyin_idx').on(table.pinyin),
  rankIdx: index('surname_rank_idx').on(table.rank)
}))

export const celebrities = pgTable('celebrities', {
  id: uuid('id').defaultRandom().primaryKey(),
  surnameId: uuid('surname_id').references(() => surnames.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  dynasty: varchar('dynasty', { length: 50 }).notNull(),
  birthYear: integer('birth_year'),
  deathYear: integer('death_year'),
  birthplace: varchar('birthplace', { length: 200 }),
  imageUrl: text('image_url'),
  summary: text('summary').notNull(),
  biography: text('biography').notNull(),
  works: text('works').notNull(),
  anecdotes: text('anecdotes'),
  externalLinks: jsonb('external_links').$type<{ label: string; url: string }[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  surnameIdIdx: index('celebrity_surname_idx').on(table.surnameId),
  dynastyIdx: index('celebrity_dynasty_idx').on(table.dynasty)
}))

export const surnamesRelations = relations(surnames, ({ many }) => ({
  celebrities: many(celebrities)
}))

export const celebritiesRelations = relations(celebrities, ({ one }) => ({
  surname: one(surnames, { fields: [celebrities.surnameId], references: [surnames.id] })
}))
