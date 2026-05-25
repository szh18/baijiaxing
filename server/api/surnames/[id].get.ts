import { db, schema } from '../../db/client'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id required' })

  const surname = await db.query.surnames.findFirst({
    where: eq(schema.surnames.id, id),
    with: { celebrities: { orderBy: (celebrities, { asc }) => [asc(celebrities.dynasty)] } }
  })

  if (!surname) throw createError({ statusCode: 404, message: 'Surname not found' })

  return surname
})
