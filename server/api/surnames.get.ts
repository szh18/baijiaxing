import { db, schema } from '../db/client'
import { and, gte, lte, ilike, sql, arrayContains } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions = []

  if (query.pinyin) {
    conditions.push(ilike(schema.surnames.pinyin, `${query.pinyin}%`))
  }
  if (query.rank_min) {
    conditions.push(gte(schema.surnames.rank, Number(query.rank_min)))
  }
  if (query.rank_max) {
    conditions.push(lte(schema.surnames.rank, Number(query.rank_max)))
  }
  if (query.junwang) {
    conditions.push(arrayContains(schema.surnames.junwang, [String(query.junwang)]))
  }

  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 200))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [data, totalResult] = await Promise.all([
    db.select().from(schema.surnames).where(where)
      .orderBy(schema.surnames.rank)
      .limit(pageSize).offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)` }).from(schema.surnames).where(where)
  ])

  return {
    data,
    total: Number(totalResult[0]?.count ?? 0),
    page,
    pageSize
  }
})
