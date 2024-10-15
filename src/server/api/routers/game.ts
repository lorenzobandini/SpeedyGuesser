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

      const wordsSet = new Set<string>()
      const maxAttempts = 100
      let attempts = 0

      while (wordsSet.size < count && attempts < maxAttempts) {
        const skip = Math.max(0, Math.floor(Math.random() * (totalCount - 1)))
        const word = await db.word.findFirst({
          where: { language },
          skip: skip,
          select: { word: true },
        })
        if (word) {
          wordsSet.add(word.word)
        }
        attempts++
      }

      if (wordsSet.size < count) {
        throw new Error(`Unable to find ${count} unique words after ${maxAttempts} attempts`)
      }

      const uniqueWordsArray = Array.from(wordsSet)
      return uniqueWordsArray
    }),
})