'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { FaCopy } from 'react-icons/fa';

import { Button } from '~/components/ui/button';
import { canStart, type RoomRole } from '~/lib/room-logic';
import type { RoomSnapshot } from '~/server/api/routers/room';
import { api } from '~/trpc/react';
import { useRoomEvents } from '~/trpc/use-room-events';

const ROLE_LIMITS: Record<RoomRole, number> = { HINTER: 2, GUESSER: 1 };

function PlayerSlot({
  player,
  players,
  userId,
  roomId,
}: {
  player: RoomSnapshot['players'][number] | undefined;
  players: RoomSnapshot['players'];
  userId: string;
  roomId: string;
}) {
  const setRole = api.room.setRole.useMutation();
  const setReady = api.room.setReady.useMutation();
  const isMe = player?.userId === userId;

  if (!player) {
    return (
      <div className="border-dark bg-second/40 text-dark/60 flex h-24 items-center justify-center rounded-xl border-2 border-dashed">
        In attesa di un giocatore...
      </div>
    );
  }

  const takenByOthers = (role: RoomRole) =>
    players.filter(p => p.userId !== player.userId && p.role === role).length;

  return (
    <div
      className={`border-dark bg-second text-dark flex h-24 items-center justify-between gap-3 rounded-xl border-2 border-dashed px-4 ${
        player.online ? '' : 'opacity-50'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {player.image ? (
          <Image
            src={player.image}
            alt=""
            width={40}
            height={40}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <div className="bg-dark flex h-10 w-10 items-center justify-center rounded-full font-bold text-white">
            {player.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-bold">{player.name ?? 'Giocatore'}</p>
          <p className="text-sm">{player.online ? 'online' : 'offline'}</p>
        </div>
      </div>

      {isMe ? (
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex gap-2">
            {(['HINTER', 'GUESSER'] as RoomRole[]).map(role => (
              <Button
                key={role}
                size={'sm'}
                variant={player.role === role ? 'default' : 'personal'}
                disabled={
                  takenByOthers(role) >= ROLE_LIMITS[role] || setRole.isPending
                }
                onClick={() => setRole.mutate({ roomId, role })}
                className={
                  player.role === role
                    ? 'bg-dark hover:bg-dark/80 text-white'
                    : undefined
                }
              >
                {role}
              </Button>
            ))}
          </div>
          <Button
            size={'sm'}
            variant={player.isReady ? 'default' : 'personal'}
            disabled={setReady.isPending}
            onClick={() =>
              setReady.mutate({ roomId, isReady: !player.isReady })
            }
            className={
              player.isReady ? 'bg-dark hover:bg-dark/80 text-white' : undefined
            }
          >
            {player.isReady ? 'Pronto ✓' : 'Pronto'}
          </Button>
        </div>
      ) : (
        <div className="shrink-0 text-right font-mono font-bold">
          {player.role ?? '—'}
          {player.isReady && <p className="text-sm">Pronto ✓</p>}
        </div>
      )}
    </div>
  );
}

export default function RoomLobby({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) {
  const router = useRouter();
  const room = api.room.getRoom.useQuery(
    { roomId },
    { refetchOnWindowFocus: false },
  );
  const { reconnecting } = useRoomEvents(roomId);
  const startGame = api.room.startGame.useMutation();
  const leaveRoom = api.room.leaveRoom.useMutation();

  useEffect(() => {
    if (room.data?.room.status === 'PLAYING') {
      router.push(`/game/online/room/${roomId}/play`);
    }
  }, [room.data?.room.status, roomId, router]);

  if (room.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-2xl font-bold text-white">Caricamento stanza...</p>
      </div>
    );
  }

  const snapshot = room.data;
  if (!snapshot || snapshot.room.status === 'ABANDONED') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-2xl font-bold text-white">
          Stanza non più disponibile
        </p>
        <Link href="/game/online">
          <Button variant={'personal'} size={'lg'}>
            Torna alla selezione
          </Button>
        </Link>
      </div>
    );
  }

  const { room: info, players } = snapshot;
  const isHost = info.hostUserId === userId;
  const ready = canStart(players);

  const handleCopyInvite = () => {
    void navigator.clipboard.writeText(
      `${window.location.origin}/game/online/join/${info.code}`,
    );
  };

  return (
    <div className="bg-main min-h-screen p-4">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-white">
            Stanza{' '}
            <span className="border-dark bg-second text-dark rounded-xl border-2 border-dashed px-3 py-1 font-mono">
              {info.code}
            </span>
          </div>
          <Button
            variant={'personal'}
            size={'sm'}
            onClick={handleCopyInvite}
            className="flex items-center gap-2"
          >
            <FaCopy /> Link invito
          </Button>
        </div>

        {reconnecting && (
          <p className="text-center font-bold text-white">Riconnessione...</p>
        )}

        <div className="flex flex-col gap-3">
          {[0, 1, 2].map(i => (
            <PlayerSlot
              key={players[i]?.userId ?? `empty-${i}`}
              player={players[i]}
              players={players}
              userId={userId}
              roomId={roomId}
            />
          ))}
        </div>

        {isHost ? (
          <div className="flex flex-col items-center gap-2">
            <Button
              variant={'personal'}
              size={'xl'}
              disabled={!ready || startGame.isPending}
              onClick={() => startGame.mutate({ roomId })}
            >
              Avvia partita
            </Button>
            {!ready && (
              <p className="font-bold text-white">
                Servono 2 HINTER e 1 GUESSER, tutti pronti
              </p>
            )}
            {startGame.error && (
              <p className="font-bold text-red-700">
                {startGame.error.message}
              </p>
            )}
          </div>
        ) : (
          <p className="text-center font-bold text-white">
            In attesa che l&apos;host avvii la partita...
          </p>
        )}

        <Button
          variant={'ghost'}
          size={'sm'}
          disabled={leaveRoom.isPending}
          onClick={() =>
            leaveRoom.mutate(
              { roomId },
              { onSuccess: () => router.push('/game/online') },
            )
          }
          className="hover:text-dark text-white"
        >
          Lascia stanza
        </Button>
      </div>
    </div>
  );
}
