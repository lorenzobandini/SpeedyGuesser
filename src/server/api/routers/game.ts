import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { GameType, WordStatus, PlayerRole, GameStatus, Language } from '~/types/enums';

export const gameRouter = createTRPCRouter({
  getRandomWords: publicProcedure
    .input(
      z.object({
        language: z.string(),
        count: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      const { language, count } = input;

      const totalCount = await db.word.count({
        where: { language },
      });

      if (totalCount === 0) {
        throw new Error("Nessuna parola trovata per la lingua selezionata");
      }

      const wordsSet = new Set<string>();
      const maxAttempts = 1000;
      let attempts = 0;

      while (wordsSet.size < count && attempts < maxAttempts) {
        const skip = Math.floor(Math.random() * totalCount);
        const word = await db.word.findFirst({
          where: { language },
          skip: skip,
          select: { word: true },
        });
        if (word) {
          wordsSet.add(word.word);
        }
        attempts++;
      }

      if (wordsSet.size < count) {
        throw new Error(
          `Impossibile trovare ${count} parole uniche dopo ${maxAttempts} tentativi`,
        );
      }

      return Array.from(wordsSet);
    }),
  createGameSingle: protectedProcedure
    .input(
      z.object({
        language: z.string(),
        timeLimit: z.number().int().positive(),
        pass: z.number().int().nonnegative(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { language, timeLimit, pass } = input;
      const userId = ctx.session.user.id;

      const game = await db.game.create({
        data: {
          userId,
          language,
          timeLimit,
          pass,
          gameType: GameType.SINGLE_DEVICE,
        },
      });

      return { gameId: game.id };
    }),
});
