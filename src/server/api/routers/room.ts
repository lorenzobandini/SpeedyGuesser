import { z } from 'zod';

import { computeRemaining, type Verdict } from '~/lib/game-logic';
import {
  canStart,
  isOnline,
  nextRoundCounters,
  shuffleWords,
} from '~/lib/room-logic';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { db } from '~/server/db';

const ONLINE_WORD_COUNT = 50;
const ABANDON_TIMEOUT_MS = 60_000;

export interface RoomSnapshot {
  room: {
    id: string;
    code: number;
    status: string;
    hostUserId: string;
    language: string;
    timeLimit: number;
    pass: number;
    version: number;
  };
  players: {
    userId: string;
    name: string | null;
    image: string | null;
    role: string | null;
    isReady: boolean;
    online: boolean;
  }[];
  game: {
    id: string;
    score: number;
    mistakes: number;
    passUsed: number;
    roundStartedAt: string | null;
    currentWordIndex: number;
    currentWord: string | null;
  } | null;
}

/** Full room state as JSON-safe payload. Single source of truth for getRoom and the SSE endpoint. */
export async function buildRoomSnapshot(
  roomId: string,
): Promise<RoomSnapshot | null> {
  const room = await db.room.findUnique({
    where: { id: roomId },
    include: {
      players: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      game: {
        include: {
          words: { include: { word: true }, orderBy: { order: 'asc' } },
        },
      },
    },
  });
  if (!room) return null;

  const now = Date.now();
  const currentIndex = room.game
    ? room.game.words.findIndex(w => w.status === 'PENDING')
    : -1;

  return {
    room: {
      id: room.id,
      code: room.code,
      status: room.status,
      hostUserId: room.hostUserId,
      language: room.language,
      timeLimit: room.timeLimit,
      pass: room.pass,
      version: room.version,
    },
    players: room.players.map(p => ({
      userId: p.user.id,
      name: p.user.name,
      image: p.user.image,
      role: p.role,
      isReady: p.isReady,
      online: isOnline(p.lastSeenAt, now),
    })),
    game: room.game
      ? {
          id: room.game.id,
          score: room.game.score,
          mistakes: room.game.mistakes,
          passUsed: room.game.passUsed,
          roundStartedAt: room.game.roundStartedAt?.toISOString() ?? null,
          currentWordIndex: currentIndex,
          // ponytail: la parola viaggia anche verso il guesser (stesso snapshot SSE a tutti); il cheating via devtools è accettabile, in futuro payload per-ruolo
          currentWord:
            currentIndex >= 0
              ? (room.game.words[currentIndex]?.word.word ?? null)
              : null,
        }
      : null,
  };
}

/** Loads a room and lazily abandons stale WAITING rooms (no heartbeat for >60s). */
async function loadRoom(roomId: string) {
  const room = await db.room.findUnique({
    where: { id: roomId },
    include: { players: true },
  });
  if (!room) throw new Error('Stanza non trovata');

  if (
    room.status === 'WAITING' &&
    room.players.length > 0 &&
    room.players.every(
      p => Date.now() - p.lastSeenAt.getTime() > ABANDON_TIMEOUT_MS,
    )
  ) {
    await db.room.update({
      where: { id: roomId },
      data: { status: 'ABANDONED', version: { increment: 1 } },
    });
    room.status = 'ABANDONED';
  }
  return room;
}

async function assertMember(roomId: string, userId: string) {
  const player = await db.roomPlayer.findUnique({
    where: { userId_roomId: { userId, roomId } },
  });
  if (!player) throw new Error('Non sei membro di questa stanza');
  return player;
}

async function requireGuesser(roomId: string, userId: string) {
  const player = await assertMember(roomId, userId);
  if (player.role !== 'GUESSER')
    throw new Error('Solo il Guesser può fare questa azione');
}

/** Marks game + room as FINISHED (words are already persisted by submitAnswer). */
async function finishGame(roomId: string, gameId: string) {
  await db.$transaction([
    db.game.update({
      where: { id: gameId },
      data: { status: 'FINISHED', endedAt: new Date() },
    }),
    db.room.update({
      where: { id: roomId },
      data: { status: 'FINISHED', version: { increment: 1 } },
    }),
  ]);
}

export const roomRouter = createTRPCRouter({
  getRoom: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ input }) => {
      const room = await loadRoom(input.roomId);
      const snapshot = await buildRoomSnapshot(room.id);
      if (!snapshot) throw new Error('Stanza non trovata');
      return snapshot;
    }),

  createRoom: protectedProcedure
    .input(
      z.object({
        language: z.string(),
        timeLimit: z.number().int().positive(),
        pass: z.number().int().nonnegative(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // ponytail: retry su collisione codice a 4 cifre; con poche stanze il primo colpo quasi sempre basta
      let code: number | null = null;
      for (let i = 0; i < 20 && !code; i++) {
        const candidate = 1000 + Math.floor(Math.random() * 9000);
        const exists = await db.room.findUnique({
          where: { code: candidate },
          select: { id: true },
        });
        if (!exists) code = candidate;
      }
      if (!code) throw new Error('Nessun codice disponibile, riprova');

      const room = await db.room.create({
        data: {
          code,
          hostUserId: userId,
          language: input.language,
          timeLimit: input.timeLimit,
          pass: input.pass,
          players: { create: { userId } },
        },
      });
      return { roomId: room.id, code: room.code };
    }),

  joinRoomByCode: protectedProcedure
    .input(z.object({ code: z.number().int().min(1000).max(9999) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const room = await db.room.findUnique({
        where: { code: input.code },
        include: { players: true },
      });
      if (!room) throw new Error('Stanza non trovata');

      const existing = room.players.find(p => p.userId === userId);
      if (existing) return { roomId: room.id }; // idempotente (link invito)

      if (room.status !== 'WAITING')
        throw new Error('La partita è già iniziata');
      if (
        room.players.length > 0 &&
        room.players.every(
          p => Date.now() - p.lastSeenAt.getTime() > ABANDON_TIMEOUT_MS,
        )
      ) {
        await db.room.update({
          where: { id: room.id },
          data: { status: 'ABANDONED', version: { increment: 1 } },
        });
        throw new Error('Stanza non disponibile');
      }
      if (room.players.length >= 3) throw new Error('La stanza è piena');

      await db.$transaction([
        db.roomPlayer.create({ data: { userId, roomId: room.id } }),
        db.room.update({
          where: { id: room.id },
          data: { version: { increment: 1 } },
        }),
      ]);
      return { roomId: room.id };
    }),

  setRole: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        role: z.enum(['HINTER', 'GUESSER']).nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { roomId, role } = input;
      const player = await assertMember(roomId, ctx.session.user.id);
      if (player.role !== role) {
        if (role !== null) {
          const taken = await db.roomPlayer.count({
            where: { roomId, role },
          });
          const max = role === 'GUESSER' ? 1 : 2;
          if (taken >= max)
            throw new Error(`Tutti gli slot ${role} sono occupati`);
        }
        await db.$transaction([
          db.roomPlayer.update({
            where: { id: player.id },
            data: { role, isReady: false },
          }),
          db.room.update({
            where: { id: roomId },
            data: { version: { increment: 1 } },
          }),
        ]);
      }
      return { ok: true };
    }),

  setReady: protectedProcedure
    .input(z.object({ roomId: z.string(), isReady: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const player = await assertMember(input.roomId, ctx.session.user.id);
      await db.$transaction([
        db.roomPlayer.update({
          where: { id: player.id },
          data: { isReady: input.isReady },
        }),
        db.room.update({
          where: { id: input.roomId },
          data: { version: { increment: 1 } },
        }),
      ]);
      return { ok: true };
    }),

  startGame: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const room = await loadRoom(input.roomId);

      if (room.hostUserId !== userId)
        throw new Error("Solo l'host può avviare la partita");
      if (room.status !== 'WAITING')
        throw new Error('La partita è già stata avviata');
      if (!canStart(room.players))
        throw new Error('Servono 2 HINTER e 1 GUESSER, tutti pronti');

      const words = await db.word.findMany({
        where: { language: room.language },
        select: { id: true },
      });
      if (words.length < ONLINE_WORD_COUNT)
        throw new Error('Non ci sono abbastanza parole per questa lingua');

      const guesser = room.players.find(p => p.role === 'GUESSER')!;
      const picked = shuffleWords(words).slice(0, ONLINE_WORD_COUNT);

      const game = await db.$transaction(async tx => {
        const g = await tx.game.create({
          data: {
            userId: guesser.userId,
            roomId: room.id,
            language: room.language,
            timeLimit: room.timeLimit,
            pass: room.pass,
            status: 'PLAYING',
            gameType: 'ONLINE',
            words: {
              create: picked.map((w, i) => ({ wordId: w.id, order: i })),
            },
          },
        });
        await tx.room.update({
          where: { id: room.id },
          data: { status: 'PLAYING', version: { increment: 1 } },
        });
        return g;
      });
      return { gameId: game.id };
    }),

  startRound: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const roomId = input.roomId;
      await requireGuesser(roomId, ctx.session.user.id);

      const room = await db.room.findUnique({
        where: { id: roomId },
        include: { game: true },
      });
      if (!room?.game || room.status !== 'PLAYING')
        throw new Error('La partita non è attiva');
      if (room.game.roundStartedAt) throw new Error('Il round è già iniziato');

      await db.$transaction([
        db.game.update({
          where: { id: room.game.id },
          data: { roundStartedAt: new Date() },
        }),
        db.room.update({
          where: { id: roomId },
          data: { version: { increment: 1 } },
        }),
      ]);
      return { ok: true };
    }),

  submitAnswer: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        verdict: z.enum(['CORRECT', 'WRONG', 'PASSED']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const roomId = input.roomId;
      const verdict: Verdict = input.verdict;
      await requireGuesser(roomId, ctx.session.user.id);

      const room = await db.room.findUnique({
        where: { id: roomId },
        include: {
          game: { include: { words: { orderBy: { order: 'asc' } } } },
        },
      });
      if (!room?.game || room.status !== 'PLAYING')
        throw new Error('Il round non è attivo');
      const game = room.game;
      const roundStartedAt = game.roundStartedAt;
      if (!roundStartedAt) throw new Error('Il round non è attivo');

      const current = game.words.find(w => w.status === 'PENDING');
      if (!current) {
        await finishGame(roomId, game.id);
        return { finished: true };
      }

      const remaining = computeRemaining(
        roundStartedAt.getTime(),
        room.timeLimit,
        Date.now(),
      );
      if (remaining <= 0) {
        await finishGame(roomId, game.id);
        return { finished: true };
      }
      if (verdict === 'PASSED' && game.passUsed >= room.pass)
        throw new Error('Pass esauriti');

      // ponytail: read-modify-write senza lock — il guesser è uno solo e i bottoni si disabilitano lato client
      const counters = nextRoundCounters(
        { score: game.score, mistakes: game.mistakes, passUsed: game.passUsed },
        verdict,
      );
      const wordsLeft =
        game.words.filter(w => w.status === 'PENDING').length - 1;

      await db.$transaction(async tx => {
        await tx.gameWord.update({
          where: { id: current.id },
          data: { status: verdict },
        });
        await tx.game.update({
          where: { id: game.id },
          data: counters,
        });
        if (wordsLeft <= 0) {
          await tx.game.update({
            where: { id: game.id },
            data: { status: 'FINISHED', endedAt: new Date() },
          });
          await tx.room.update({
            where: { id: roomId },
            data: { status: 'FINISHED', version: { increment: 1 } },
          });
        } else {
          await tx.room.update({
            where: { id: roomId },
            data: { version: { increment: 1 } },
          });
        }
      });
      return { finished: wordsLeft <= 0 };
    }),

  finishRound: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const roomId = input.roomId;
      await assertMember(roomId, ctx.session.user.id);

      const room = await db.room.findUnique({
        where: { id: roomId },
        include: { game: true },
      });
      if (!room?.game) throw new Error('Nessuna partita attiva');
      if (room.status !== 'PLAYING') throw new Error('La partita non è attiva');

      await finishGame(roomId, room.game.id);
      return { ok: true };
    }),

  leaveRoom: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const roomId = input.roomId;
      const userId = ctx.session.user.id;
      const player = await assertMember(roomId, userId);

      const room = await db.room.findUnique({ where: { id: roomId } });
      if (!room) throw new Error('Stanza non trovata');

      await db.roomPlayer.delete({ where: { id: player.id } });
      const left = await db.roomPlayer.count({ where: { roomId } });

      if (
        left === 0 ||
        (room.hostUserId === userId && room.status === 'WAITING')
      ) {
        await db.room.update({
          where: { id: roomId },
          data: { status: 'ABANDONED', version: { increment: 1 } },
        });
      } else {
        await db.room.update({
          where: { id: roomId },
          data: { version: { increment: 1 } },
        });
      }
      return { ok: true };
    }),
});
