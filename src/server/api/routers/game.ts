import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

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
      }),
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
          gameType: "SINGLE_DEVICE",
        },
      });

      return { gameId: game.id };
    }),

  getGameById: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { gameId } = input;
      const userId = ctx.session.user.id;

      const game = await db.game.findUnique({
        where: { id: gameId },
      });

      if (!game || game.userId !== userId) {
        throw new Error("Gioco non trovato o accesso negato");
      }

      return game;
    }),

  updateGameResults: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        score: z.number().int(),
        passUsed: z.number().int(),
        mistakes: z.number().int(),
        wordsData: z.array(
          z.object({
            word: z.string(),
            outcome: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { gameId, score, passUsed, mistakes, wordsData } = input;
      const userId = ctx.session.user.id;

      const game = await db.game.findUnique({
        where: { id: gameId },
      });

      if (!game || game.userId !== userId) {
        throw new Error("Gioco non trovato o accesso negato");
      }

      await db.game.update({
        where: { id: gameId },
        data: {
          score,
          passUsed,
          mistakes,
          endedAt: new Date(),
          status: "COMPLETED",
        },
      });

      for (let i = 0; i < wordsData.length; i++) {
        const wordData = wordsData[i];
        if (!wordData) continue;
        const word = await db.word.findFirst({
          where: { word: wordData.word, language: game.language },
        });

        if (word) {
          await db.gameWord.create({
            data: {
              gameId: game.id,
              wordId: word.id,
              status: wordData.outcome,
              order: i,
            },
          });
        }
      }

      return { success: true };
    }),

  getGameWords: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { gameId } = input;
      const userId = ctx.session.user.id;

      const game = await db.game.findUnique({
        where: { id: gameId },
      });

      if (!game || game.userId !== userId) {
        throw new Error("Gioco non trovato o accesso negato");
      }

      const gameWords = await db.gameWord.findMany({
        where: { gameId },
        include: { word: true },
        orderBy: { order: "asc" },
      });

      return gameWords.map((gw) => ({
        word: gw.word.word,
        outcome: gw.status,
      }));
    }),
});