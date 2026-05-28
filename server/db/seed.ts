import { getDb, schema } from './client'
import { seedSurnames, seedCelebrities } from './seed-data'

async function seed() {
  const db = getDb()
  console.log('Clearing existing data...')
  await db.delete(schema.celebrities)
  await db.delete(schema.surnames)

  console.log('Seeding surnames...')
  for (const s of seedSurnames) {
    await db.insert(schema.surnames).values({
      name: s.name,
      pinyin: s.pinyin,
      rank: s.rank,
      origin: s.origin,
      ancestor: s.ancestor,
      junwang: s.junwang,
      tanghao: s.tanghao
    }).onConflictDoNothing()
  }
  console.log(`  Inserted ${seedSurnames.length} surnames`)

  console.log('Seeding celebrities...')
  const surnameRecords = await db.select().from(schema.surnames)
  const surnameMap = new Map(surnameRecords.map(s => [s.name, s.id]))

  let celebCount = 0
  for (const c of seedCelebrities) {
    const surnameId = surnameMap.get(c.surname)
    if (!surnameId) {
      console.warn(`  Surname "${c.surname}" not found, skipping "${c.name}"`)
      continue
    }
    await db.insert(schema.celebrities).values({
      surnameId,
      name: c.name,
      dynasty: c.dynasty,
      birthYear: c.birthYear ?? null,
      deathYear: c.deathYear ?? null,
      birthplace: c.birthplace ?? null,
      summary: c.summary,
      biography: c.biography,
      works: c.works,
      anecdotes: c.anecdotes ?? null,
      externalLinks: c.externalLinks
    })
    celebCount++
  }
  console.log(`  Inserted ${celebCount} celebrities`)

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
