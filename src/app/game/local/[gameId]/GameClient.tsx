"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { Session } from "next-auth";
import { Button } from "~/components/ui/button";
import { FaMinus, FaPlus, FaPlay, FaPause } from "react-icons/fa";
import { RiSkipForwardFill } from "react-icons/ri";
import { Toaster } from "~/components/ui/toaster";
import { useToast } from "~/hooks/use-toast";
import type { GameState } from "@prisma/client";

interface getGameState {
  id: string;
  gameId: string;
  actualTime: number;
  actualScore: number;
  actualPass: number;
  actualIndexWord: number;
  actualStatus: string;
  isTimerRunning: boolean;
}

interface Game {
  id: string;
  roomId: string;
  userId: string | null;
  score: number;
  language: string;
  timeLimit: number;
  pass: number;
  passUsed: number;
  mistakes: number;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
  gameType: string;
}

/*
Inizialmente
        data: {
          gameId,
          actualTime: game.timeLimit,
          actualScore: 0,
          actualPass: game.pass,
          actualIndexWord: 0,
          actualStatus: 'IN_PROGRESS',
          isTimerRunning: false,
        },

In game invece troviamo gli altri dati


*/

export default function GameClient({ session }: { session: Session | null }) {
  const router = useRouter();

  const params = useParams<Record<string, string | string[]>>();
  const gameIdParam = params?.gameId;
  const gameId = Array.isArray(gameIdParam)
    ? gameIdParam[0]
    : (gameIdParam ?? "");

  const [gameState, setGameState] = useState<GameState>();

  const createGameState = api.game.createGameState.useMutation();
  const getGameState = api.game.getGameState.useQuery(
    { gameId: gameId ?? "" },
    { refetchInterval: 1000},
  );
  const getWords = api.game.getGameWords.useQuery({ gameId: gameId ?? "" },{ enabled: false});
  const updateGameState = api.game.updateGameState.useMutation();

  useEffect(() => {
    const initializeGameState = async () => {
      try {
        if (!gameId) return;

        const state = await createGameState.mutateAsync({ gameId });
        if (state) {
          setGameState(state);
          await getWords.refetch();
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (!gameState) {
      void initializeGameState();
    }
  }, [gameId, gameState, createGameState, getWords]);

  useEffect(() => {
    if (getGameState.data) {
      setGameState(getGameState.data);
    }
  }, [getGameState.data]);

  const handleStateChange = async (newState: GameState) => {
    setGameState(newState);
    try {
      const { gameId, ...restState } = newState;
      if (!gameId) return;
      await updateGameState.mutateAsync({ gameId, ...restState });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-main p-4 text-dark">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="text-3xl font-bold text-white">
            Speedy<span className="text-dark">Guesser</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden text-2xl font-bold sm:block">Tempo:</div>
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-dark bg-second font-mono text-5xl font-bold text-dark">
              {remainingTime}
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-20 w-full max-w-2xl items-center justify-center rounded-xl border-2 border-dashed border-dark bg-third font-mono text-4xl font-bold text-dark">
            {wordRevealed
              ? (someWords.data?.[currentWordIndex] ?? "")
              : "?????"}
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex w-1/4 flex-col items-center">
            <div className="text-2xl font-bold">Punteggio</div>
            <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-dark bg-second font-mono text-3xl font-bold text-dark">
              {score.toString().padStart(2, "0")}
            </div>
          </div>

          <div className="flex w-2/4 justify-center">
            <Button
              variant="personal"
              size="lg"
              onClick={togglePause}
              className="flex h-32 w-32 items-center justify-center rounded-full bg-dark text-6xl text-white transition-colors hover:bg-dark/80"
            >
              {isPaused ? <FaPlay /> : <FaPause />}
            </Button>
          </div>

          <div className="flex w-1/4 flex-col items-center">
            <div className="text-2xl font-bold text-dark">Passi</div>
            <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-dark bg-second font-mono text-3xl font-bold">
              {remainingPasses}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-8">
          <Button
            variant="personal"
            size="lg"
            onClick={handleIncorrect}
            disabled={!isPaused || !wordRevealed || hasChosen || isProcessing}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-dark text-4xl text-white transition-all hover:bg-dark/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaMinus />
          </Button>
          <Button
            variant="personal"
            size="lg"
            onClick={handlePass}
            disabled={
              remainingPasses === 0 ||
              !isPaused ||
              !wordRevealed ||
              hasChosen ||
              isProcessing
            }
            className="flex h-24 w-24 items-center justify-center rounded-full bg-dark text-4xl text-white transition-all hover:bg-dark/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RiSkipForwardFill />
          </Button>
          <Button
            variant="personal"
            size="lg"
            onClick={handleCorrect}
            disabled={!isPaused || !wordRevealed || hasChosen || isProcessing}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-dark text-4xl text-white transition-all hover:bg-dark/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaPlus />
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
