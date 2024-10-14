import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { db } from '~/server/db'

export const gameRouter = createTRPCRouter({
  getRandomWords: publicProcedure
    .input(
      z.object({
        language: z.string(),
        count: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      const { language, count } = input

      const totalCount = await db.word.count({
        where: { language },
      })

      const skip = Math.max(0, Math.floor(Math.random() * (totalCount - count)))

      const words = await db.word.findMany({
        where: { language },
        take: count,
        skip: skip,
      })

      return words.map(word => word.word)
    }),
})