
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { EventEmitter } from "events";
import { observable } from '@trpc/server/observable';
import type { RoomPlayer } from "@prisma/client";
import type { RoomWithPlayers } from "~/types/game";

const roomEvents = new EventEmitter();
const roomPlayerEvents = new EventEmitter();

export const roomRouter = createTRPCRouter({
  createRoom: protectedProcedure
    .input(
      z.object({
        language: z.string(),
        timeLimit: z.number().int().positive(),
        pass: z.number().int().nonnegative(),
      })
    )
    .mutation(async ({ input }) => {
      const { language, timeLimit, pass } = input;

      let code: number;
      let attempts = 0;
      const maxAttempts = 10;
      let existingRoom = null;

      do {
        code = Math.floor(1000 + Math.random() * 9000);
        existingRoom = await db.room.findUnique({
          where: { code },
        });
        attempts++;
      } while (existingRoom && attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new Error("Impossibile generare un codice stanza unico");
      }

      const room = await db.room.create({
        data: {
          code,
          gameType: "LOCAL_MULTIPLAYER",
          language,
          timeLimit,
          pass,
        },
      });

      roomEvents.emit(`roomUpdate:${room.id}`);

      return { roomId: room.id };
    }),
  
  getRoomById: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ input }) => {
      const { roomId } = input;
      const room = await db.room.findUnique({
        where: { id: roomId },
        include: {
          players: {
            include: {
              user: true,
            },
          },
        },
      });

      return room;
    }),

  joinRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        role: z.enum(["HINTER", "GUESSER"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { roomId, role } = input;
      const userId = ctx.session.user.id;

      console.log("Joining room", roomId, role, userId);
      const existingPlayer = await db.roomPlayer.findFirst({
        where: {
          roomId,
          userId,
        },
      });

      console.log("Existing player", existingPlayer);

      if (existingPlayer) {
        console.log("Player already exists, updating role");
        await db.roomPlayer.update({
          where: { id: existingPlayer.id },
          data: { role },
        });
      } else {
        console.log("Player does not exist, creating new player");
        await db.roomPlayer.create({
          data: {
            roomId,
            userId,
            role,
          },
        });
      }

      roomEvents.emit(`roomUpdate:${input.roomId}`);
      roomPlayerEvents.emit(`roomPlayerUpdate:${input.roomId}`);
      return { success: true };
    }),

  leaveRoom: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { roomId } = input;
      const userId = ctx.session.user.id;

      await db.roomPlayer.deleteMany({
        where: {
          roomId,
          userId,
        },
      });

      roomEvents.emit(`roomUpdate:${input.roomId}`);
      roomPlayerEvents.emit(`roomPlayerUpdate:${input.roomId}`);
      return { success: true };
    }),
    
  updatePlayerRole: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        role: z.enum(["HINTER", "GUESSER"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { roomId, role } = input;
      const userId = ctx.session.user.id;

      const player = await db.roomPlayer.findFirst({
        where: {
          roomId,
          userId,
        },
      });
      
      if(player) {
        await db.roomPlayer.update({
          where: { id: player.id },
          data: { role },
        });
        roomEvents.emit(`roomUpdate:${roomId}`);
        roomPlayerEvents.emit(`roomPlayerUpdate:${roomId}`);
        return { success: true };
      }else{
        return { success: false };
      }
    }),

  getRoomIdByCode: protectedProcedure
    .input(
      z.object({
        code: z.number().int(),
      })
    )
    .query(async ({ input }) => {
      const { code } = input;

      const room = await db.room.findUnique({
        where: { code },
        select: { id: true },
      });

      if (!room) {
        throw new Error("Stanza non trovata");
      }

      return { roomId: room.id };
    }),

  onRoomUpdate: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .subscription(({ input }) => {
      const { roomId } = input;

      return observable<RoomWithPlayers | null>((emit) => {
        const sendUpdate = async () => {
          const room = await db.room.findUnique({
            where: { id: roomId },
            include: {
              players: {
                include: {
                  user: true,
                },
              },
            },
          });
          emit.next(room);
        };

        void sendUpdate();

        const onRoomUpdate = () => {
          console.log("Room update event received");
          void sendUpdate();
        };

        roomEvents.on(`roomUpdate:${roomId}`, onRoomUpdate);

        return () => {
          roomEvents.off(`roomUpdate:${roomId}`, onRoomUpdate);
        };
      });
  }),

  onRoomPlayerUpdate: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .subscription(({ input }) => {
      const { roomId } = input;

      return observable<RoomPlayer[] | null>((emit) => {
        const sendUpdate = async () => {
          const room = await db.room.findUnique({
            where: { id: roomId },
            include: {
              players: {
                include: {
                  user: true,
                },
              },
            },
          });
          emit.next(room?.players ?? null);
        };

        void sendUpdate();

        const onPlayerUpdate = () => {
          console.log("RoomPlayer update event received");
          void sendUpdate();
        };

        roomPlayerEvents.on(`roomPlayerUpdate:${roomId}`, onPlayerUpdate);

        return () => {
          roomPlayerEvents.off(`roomPlayerUpdate:${roomId}`, onPlayerUpdate);
        };
      });
  }),
});