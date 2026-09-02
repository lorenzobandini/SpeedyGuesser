'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '~/components/ui/button';
import { api } from '~/trpc/react';

export default function JoinClient({ code }: { code: number }) {
  const router = useRouter();
  const joinRoom = api.room.joinRoomByCode.useMutation();

  useEffect(() => {
    // idempotent server-side: re-joining a room you're already in just returns it
    joinRoom.mutate(
      { code },
      { onSuccess: room => router.replace(`/game/online/room/${room.roomId}`) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  if (joinRoom.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-2xl font-bold text-white">
          {joinRoom.error.message}
        </p>
        <Link href="/game/online">
          <Button variant={'personal'} size={'lg'}>
            Torna alla selezione
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-2xl font-bold text-white">Accesso alla stanza...</p>
    </div>
  );
}
