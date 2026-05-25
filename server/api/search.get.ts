import { db, schema } from '../db/client'
import { or, ilike } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const q = String(getQuery(event).q || '').trim()
  if (!q) return { data: [], total: 0 }

  const pattern = `%${q}%`

  const [surnameResults, celebrityResults] = await Promise.all([
    db.select({
      id: schema.surnames.id,
      name: schema.surnames.name,
      pinyin: schema.surnames.pinyin,
      rank: schema.surnames.rank
    }).from(schema.surnames)
      .where(or(
        ilike(schema.surnames.name, pattern),
        ilike(schema.surnames.pinyin, pattern)
      ))
      .limit(20),

    db.select({
      id: schema.celebrities.id,
      name: schema.celebrities.name,
      dynasty: schema.celebrities.dynasty,
      summary: schema.celebrities.summary,
      surnameId: schema.celebrities.surnameId
    }).from(schema.celebrities)
      .where(or(
        ilike(schema.celebrities.name, pattern),
        ilike(schema.celebrities.summary, pattern)
      ))
      .limit(50)
  ])

  const surnames = surnameResults.map(s => ({ type: 'surname' as const, data: s }))
  const celebrities = celebrityResults.map(c => ({ type: 'celebrity' as const, data: c }))

  return {
    data: [...surnames, ...celebrities],
    total: surnames.length + celebrities.length
  }
})
