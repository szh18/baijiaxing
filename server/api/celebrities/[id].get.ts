import { db, schema } from '../../db/client'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id required' })

  const celebrity = await db.query.celebrities.findFirst({
    where: eq(schema.celebrities.id, id),
    with: { surname: true }
  })

  if (!celebrity) throw createError({ statusCode: 404, message: 'Celebrity not found' })

  return celebrity
})
