import { getDb, schema } from '../db/client'
import { and, eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = getDb()
  const query = getQuery(event)
  const conditions = []

  if (query.surname_id) {
    conditions.push(eq(schema.celebrities.surnameId, String(query.surname_id)))
  }
  if (query.dynasty) {
    conditions.push(eq(schema.celebrities.dynasty, String(query.dynasty)))
  }

  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 50))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [data, totalResult] = await Promise.all([
    db.select().from(schema.celebrities).where(where)
      .orderBy(schema.celebrities.dynasty)
      .limit(pageSize).offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)` }).from(schema.celebrities).where(where)
  ])

  return {
    data,
    total: Number(totalResult[0]?.count ?? 0),
    page,
    pageSize
  }
})
