'use client';

import { getQueryKey } from '@trpc/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import type { RoomSnapshot } from '~/server/api/routers/room';
import { api } from '~/trpc/react';

/**
 * Subscribes to the room SSE stream. The server sends one full snapshot per
 * connection and closes it (serverless-friendly); EventSource reconnects natively,
 * so state stays fresh ~1s. "Reconnecting" only shows if data stops arriving.
 */
export function useRoomEvents(roomId: string) {
  const queryClient = useQueryClient();
  const [reconnecting, setReconnecting] = useState(false);
  const lastMessageAt = useRef(Date.now());

  useEffect(() => {
    const source = new EventSource(`/api/rooms/${roomId}/events`);

    source.onmessage = event => {
      lastMessageAt.current = Date.now();
      setReconnecting(false);
      const snapshot = JSON.parse(event.data as string) as RoomSnapshot;
      queryClient.setQueryData(
        getQueryKey(api.room.getRoom, { roomId }),
        snapshot,
      );
    };
    // native EventSource reconnects on its own after the server closes the stream
    source.onerror = null;

    const watchdog = setInterval(() => {
      setReconnecting(Date.now() - lastMessageAt.current > 4000);
    }, 1000);

    return () => {
      source.close();
      clearInterval(watchdog);
    };
  }, [roomId, queryClient]);

  return { reconnecting };
}
