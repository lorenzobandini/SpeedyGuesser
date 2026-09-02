'use client';

import { getQueryKey } from '@trpc/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import type { RoomSnapshot } from '~/server/api/routers/room';
import { api } from '~/trpc/react';

/**
 * Subscribes to the room SSE stream and writes each pushed snapshot directly
 * into the react-query cache used by `api.room.getRoom`. The server pushes the
 * full snapshot, so no refetch is needed.
 */
export function useRoomEvents(roomId: string) {
  const queryClient = useQueryClient();
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const source = new EventSource(`/api/rooms/${roomId}/events`);

    source.onmessage = event => {
      setReconnecting(false);
      const snapshot = JSON.parse(event.data as string) as RoomSnapshot;
      queryClient.setQueryData(
        getQueryKey(api.room.getRoom, { roomId }),
        snapshot,
      );
    };
    // native EventSource reconnects on its own after the server closes the stream
    source.onerror = () => setReconnecting(true);

    return () => source.close();
  }, [roomId, queryClient]);

  return { reconnecting };
}
