'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { RiSkipForwardFill } from 'react-icons/ri';

import {
  GameTimer,
  WordCard,
  ScoreBar,
} from '~/app/_components/game/GameBoard';
import { Button } from '~/components/ui/button';
import { computeRemaining, type Verdict } from '~/lib/game-logic';
import { api } from '~/trpc/react';
import { useRoomEvents } from '~/trpc/use-room-events';

function RoundHeader({ time }: { time: number }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="text-3xl font-bold text-white">
        Speedy<span className="text-dark">Guesser</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden text-2xl font-bold sm:block">Tempo:</div>
        <GameTimer time={time} />
      </div>
    </div>
  );
}

export default function RoomPlay({
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
  const startRound = api.room.startRound.useMutation();
  const submitAnswer = api.room.submitAnswer.useMutation();
  const finishRound = api.room.finishRound.useMutation();

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [countdown, setCountdown] = useState(3);
  const finishedRef = useRef(false);
  // last word index the guesser already answered (optimistic, prevents double submits)
  const answeredRef = useRef(-1);

  const snapshot = room.data;
  const game = snapshot?.game ?? null;
  const myRole = snapshot?.players.find(p => p.userId === userId)?.role ?? null;
  const isGuesser = myRole === 'GUESSER';

  // room still in lobby or abandoned → go back / show notice
  useEffect(() => {
    if (snapshot?.room.status === 'WAITING') {
      router.replace(`/game/online/room/${roomId}`);
    }
  }, [snapshot?.room.status, roomId, router]);

  // round finished → stats for everyone
  useEffect(() => {
    if (snapshot?.room.status === 'FINISHED' && game) {
      router.push(`/stats/${game.id}`);
    }
  }, [snapshot?.room.status, game, router]);

  // 3-2-1 countdown, then the guesser starts the round server-side
  useEffect(() => {
    if (!game || game.roundStartedAt) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    if (isGuesser && !startRound.isPending) {
      startRound.mutate({ roomId });
    }
  }, [game, game?.roundStartedAt, countdown, isGuesser, roomId, startRound]);

  if (room.isLoading || !snapshot) {
    return (
      <div className="bg-main flex min-h-screen items-center justify-center">
        <p className="text-2xl font-bold text-white">Caricamento...</p>
      </div>
    );
  }

  if (snapshot.room.status === 'ABANDONED' || !game) {
    return (
      <div className="bg-main flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-white">
          Stanza non più disponibile
        </p>
      </div>
    );
  }

  const roundStartedAt = game.roundStartedAt
    ? new Date(game.roundStartedAt).getTime()
    : null;

  if (!roundStartedAt) {
    return (
      <div className="bg-main flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-5xl font-bold text-white">
          {countdown > 0 ? countdown : 'Via!'}
        </p>
        {startRound.error && (
          <p className="font-bold text-red-700">{startRound.error.message}</p>
        )}
        {reconnecting && (
          <p className="font-bold text-white">Riconnessione...</p>
        )}
      </div>
    );
  }

  const timeRemaining = computeRemaining(
    roundStartedAt,
    snapshot.room.timeLimit,
    now,
  );

  // timer expired → any member asks the server to finish
  if (timeRemaining <= 0 && !finishedRef.current) {
    finishedRef.current = true;
    finishRound.mutate({ roomId });
  }

  if (game.currentWordIndex > answeredRef.current) {
    answeredRef.current = game.currentWordIndex;
  }
  const canAnswer =
    isGuesser &&
    game.currentWordIndex > answeredRef.current &&
    timeRemaining > 0;

  const handleVerdict = (verdict: Verdict) => {
    if (!canAnswer || submitAnswer.isPending) return;
    answeredRef.current = game.currentWordIndex;
    submitAnswer.mutate({ roomId, verdict });
  };

  return (
    <div className="bg-main min-h-screen p-4">
      <div className="mx-auto max-w-6xl">
        <RoundHeader time={timeRemaining} />

        {reconnecting && (
          <p className="mb-4 text-center font-bold text-white">
            Riconnessione...
          </p>
        )}
        {submitAnswer.error && (
          <p className="mb-4 text-center font-bold text-red-700">
            {submitAnswer.error.message}
          </p>
        )}

        <div className="mb-8 flex items-center justify-center">
          {/* only hinters see the word, TV style; the guesser judges from their hints */}
          <WordCard word={game.currentWord ?? ''} revealed={!isGuesser} />
        </div>

        <ScoreBar
          score={game.score}
          passes={snapshot.room.pass - game.passUsed}
        >
          {isGuesser ? (
            <div className="flex justify-center gap-8">
              <Button
                variant="personal"
                size="lg"
                onClick={() => handleVerdict('WRONG')}
                disabled={!canAnswer || submitAnswer.isPending}
                className="bg-dark hover:bg-dark/80 flex h-24 w-24 items-center justify-center rounded-full text-4xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaMinus />
              </Button>
              <Button
                variant="personal"
                size="lg"
                onClick={() => handleVerdict('PASSED')}
                disabled={!canAnswer || submitAnswer.isPending}
                className="bg-dark hover:bg-dark/80 flex h-24 w-24 items-center justify-center rounded-full text-4xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RiSkipForwardFill />
              </Button>
              <Button
                variant="personal"
                size="lg"
                onClick={() => handleVerdict('CORRECT')}
                disabled={!canAnswer || submitAnswer.isPending}
                className="bg-dark hover:bg-dark/80 flex h-24 w-24 items-center justify-center rounded-full text-4xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaPlus />
              </Button>
            </div>
          ) : (
            <p className="text-xl font-bold text-white">
              Dai gli indizi al Guesser!
            </p>
          )}
        </ScoreBar>

        <p className="text-center font-bold text-white">
          Parola {game.currentWordIndex + 1}
        </p>
      </div>
    </div>
  );
}
