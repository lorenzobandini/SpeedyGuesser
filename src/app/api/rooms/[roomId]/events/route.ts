import { auth } from '~/server/auth';
import { buildRoomSnapshot } from '~/server/api/routers/room';
import { db } from '~/server/db';

export const dynamic = 'force-dynamic';

// ponytail: snapshot-and-close instead of a long-lived stream — libsql queries hang inside
// long-lived serverless invocations (stale keep-alive sockets, no timeout), so each EventSource
// reconnect gets a fresh invocation. Client polls ~1/s via native reconnect (retry hint below).
// Upgrade path if invocation costs matter: Pusher (see revival plan §4c).

const encoder = new TextEncoder();

function sse(body: string) {
  return new Response(encoder.encode(body), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;

  const session = await auth();
  if (!session?.user) {
    // 200 + close (instead of 401): EventSource never reconnects on 4xx, but transient
    // cold-start auth flakes must not kill the client — the browser reconnects after close.
    return sse('retry: 5000\nevent: retry\ndata: auth');
  }

  const membership = await db.roomPlayer.findUnique({
    where: { userId_roomId: { userId: session.user.id, roomId } },
  });
  if (!membership) {
    return sse('retry: 5000\nevent: retry\ndata: member');
  }

  // presence: every reconnect refreshes the heartbeat
  await db.roomPlayer.update({
    where: { id: membership.id },
    data: { lastSeenAt: new Date() },
  });

  const snapshot = await buildRoomSnapshot(roomId);
  if (!snapshot) {
    return sse('retry: 5000\nevent: retry\ndata: gone');
  }

  return sse(`retry: 1000\ndata: ${JSON.stringify(snapshot)}`);
}
