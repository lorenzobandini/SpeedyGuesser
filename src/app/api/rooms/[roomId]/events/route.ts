import { auth } from '~/server/auth';
import { buildRoomSnapshot } from '~/server/api/routers/room';
import { db } from '~/server/db';

export const dynamic = 'force-dynamic';

const TICK_MS = 300;
const HEARTBEAT_MS = 5_000;
const MAX_DURATION_MS = 55_000; // Netlify cuts SSE at ~60s: close first, the browser reconnects natively

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;

  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const membership = await db.roomPlayer.findUnique({
    where: { userId_roomId: { userId: session.user.id, roomId } },
  });
  if (!membership) {
    return new Response('Forbidden', { status: 403 });
  }

  const encoder = new TextEncoder();
  const startedAt = Date.now();

  const stream = new ReadableStream({
    start(controller) {
      let lastSentVersion = -1;
      let lastHeartbeat = 0;
      let busy = false;
      const timers: ReturnType<typeof setInterval>[] = [];

      const close = () => {
        for (const t of timers) clearInterval(t);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      request.signal.addEventListener('abort', close);

      const tick = async () => {
        // DIAGNOSTIC: pure-timer keepalive, no DB — distinguishes frozen timers from hung queries
        controller.enqueue(encoder.encode(': ka\n\n'));
        if (busy) return;
        busy = true;
        try {
          const now = Date.now();
          if (now - startedAt > MAX_DURATION_MS) {
            controller.enqueue(
              encoder.encode('event: reconnect\ndata: refresh\n\n'),
            );
            close();
            return;
          }

          if (now - lastHeartbeat > HEARTBEAT_MS) {
            lastHeartbeat = now;
            await db.roomPlayer.update({
              where: { id: membership.id },
              data: { lastSeenAt: new Date() },
            });
          }

          const room = await db.room.findUnique({
            where: { id: roomId },
            select: { version: true },
          });
          if (room && room.version > lastSentVersion) {
            lastSentVersion = room.version;
            const snapshot = await buildRoomSnapshot(roomId);
            if (!snapshot) {
              close();
              return;
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`),
            );
          }
        } catch {
          // transient DB/network error: skip tick, next tick retries
        } finally {
          busy = false;
        }
      };

      // headers must be flushed with the first event, so send the initial snapshot right away
      void tick();
      timers.push(setInterval(() => void tick(), TICK_MS));
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
