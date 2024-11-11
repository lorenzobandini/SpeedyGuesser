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
import { redirect } from "next/navigation";


export default function GameClient({ session }: { session: Session | null }) {

  if (!session) {
    redirect("/auth/signin");
  }
  
  const router = useRouter();
  const { toast } = useToast();

  const params = useParams<Record<string, string | string[]>>();
  const gameIdParam = params?.gameId;
  const gameId = Array.isArray(gameIdParam)
    ? gameIdParam[0]
    : (gameIdParam ?? "");

  const [gameState, setGameState] = useState<GameState>();
  const [isProcessing, setIsProcessing] = useState(false);


  const createGameState = api.game.createGameState.useMutation();
  const getGameState = api.game.getGameState.useQuery(
    { gameId: gameId ?? "" },
    { refetchInterval: 1000},
  );
  const getWords = api.game.getGameWords.useQuery({ gameId: gameId ?? "" },{ enabled: false});
  const updateGameState = api.game.updateGameState.useMutation();
  const updateGameResults = api.game.updateGameResults.useMutation();
  const getGame = api.game.getGameById.useQuery({ gameId: gameId ?? "" });

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

  useEffect(() => {
    if (gameState && gameState.actualTime > 0 && gameState.isTimerRunning) {
      const timer = setTimeout(() => {
        void handleStateChange({
          ...gameState,
          actualTime: gameState.actualTime - 1,
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  
  useEffect(() => {
    if (gameState?.actualTime === 0 && gameState?.isTimerRunning) {
      void handleStateChange({
        ...gameState,
        isTimerRunning: false,
      });
      updateGameResults.mutate(
        {
          gameId: gameState.gameId,
          score: gameState.actualScore,
          passUsed: getGame.data?.pass != undefined ? getGame.data.pass - gameState.actualPass : 0,
          mistakes: gameState.actualIndexWord + 1 - gameState.actualScore,
          wordsData: getWords.data ?? [],
        },
      
        {
          onSuccess: () => {
            router.push(`/stats/${gameState.gameId}`);
          },
          onError: () => {
            toast({
              title: "Errore",
              description: "Errore nel salvataggio dei risultati.",
              variant: "destructive",
            });
          },
        }
      );
    }
  }, [gameState, router, updateGameState]);

  const handleCorrect = () => {
    if (!gameState?.isTimerRunning || gameState?.wordRevealed || gameState?.hasChosen) return;
    setIsProcessing(true);
    setTimeout(() => {
      void handleStateChange({
        ...gameState,
        actualScore: gameState.actualScore + 1,
        hasChosen: true,
        });
      toast({
        title: "Correct!",
        description: "You've earned a point.",
        variant: "success",
      });
      nextWord();
      setIsProcessing(false);
    }, 500);
  };

  const handleIncorrect = () => {
    if (!gameState?.isTimerRunning || !gameState?.wordRevealed || gameState?.hasChosen) return;
    setIsProcessing(true);
    setTimeout(() => {
      void handleStateChange({
        ...gameState,
        actualScore: Math.max(0, gameState.actualScore - 1),
        hasChosen: true,
      });
      toast({
        title: "Incorrect",
        description: "You've lost a point.",
        variant: "destructive",
      });
      nextWord();
      setIsProcessing(false);
    }, 500);
  };

  const handlePass = () => {
    if (
      !gameState?.isTimerRunning ||
      !gameState?.wordRevealed ||
      gameState.actualPass <= 0 ||
      gameState?.hasChosen
    )
      return;
    setIsProcessing(true);
    setTimeout(() => {
      void handleStateChange({
        ...gameState,
        actualPass: gameState.actualPass - 1,
        hasChosen: true,
      });
      toast({
        title: "Passed",
        description: "You've used a pass.",
        variant: "info",
      });
      nextWord();
      setIsProcessing(false);
    }, 500);
  };

  const nextWord = () => {
    if (getWords.data && gameState) {
      const nextIndex =
        gameState.actualIndexWord < getWords.data.length - 1
          ? gameState.actualIndexWord + 1
          : 0;
      void handleStateChange({
        ...gameState,
        actualIndexWord: nextIndex,
        hasChosen: true,
      });
    }
  };

  const togglePause = () => {
    if (gameState) {
      if (gameState.isTimerRunning) {
        if (gameState.wordRevealed && !gameState.hasChosen) {
          toast({
            title: "Action Required",
            description: "You must choose an option before continuing!",
            variant: "warning",
          });
          return;
        }
        void handleStateChange({
          ...gameState,
          wordRevealed: true,
          isTimerRunning: false,
        });
        nextWord();
      } else {
        void handleStateChange({
          ...gameState,
          isTimerRunning: true,
        });
      }
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
              {gameState?.actualTime ?? 0}
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-20 w-full max-w-2xl items-center justify-center rounded-xl border-2 border-dashed border-dark bg-third font-mono text-4xl font-bold text-dark">
              {gameState?.wordRevealed && gameState
              ? getWords.data?.[gameState.actualIndexWord]?.word ?? ""
              : "?????"}
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex w-1/4 flex-col items-center">
            <div className="text-2xl font-bold">Punteggio</div>
            <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-dark bg-second font-mono text-3xl font-bold text-dark">
              {gameState?.actualScore.toString().padStart(2, "0")}
            </div>
          </div>

          <div className="flex w-2/4 justify-center">
            <Button
              variant="personal"
              size="lg"
              onClick={togglePause}
              className="flex h-32 w-32 items-center justify-center rounded-full bg-dark text-6xl text-white transition-colors hover:bg-dark/80"
            >
              {!gameState?.isTimerRunning ? <FaPlay /> : <FaPause />}
            </Button>
          </div>

          <div className="flex w-1/4 flex-col items-center">
            <div className="text-2xl font-bold text-dark">Passi</div>
            <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-dark bg-second font-mono text-3xl font-bold">
              {gameState?.actualPass}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-8">
          <Button
            variant="personal"
            size="lg"
            onClick={handleIncorrect}
            disabled={gameState?.isTimerRunning ?? !gameState?.wordRevealed ?? gameState?.hasChosen ?? isProcessing}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-dark text-4xl text-white transition-all hover:bg-dark/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaMinus />
          </Button>
          <Button
            variant="personal"
            size="lg"
            onClick={handlePass}
            disabled={
              (gameState?.actualPass === 0) ||
              (gameState?.isTimerRunning ?? 
              !gameState?.wordRevealed ??
              gameState?.hasChosen ??
              isProcessing)
            }
            className="flex h-24 w-24 items-center justify-center rounded-full bg-dark text-4xl text-white transition-all hover:bg-dark/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RiSkipForwardFill />
          </Button>
          <Button
            variant="personal"
            size="lg"
            onClick={handleCorrect}
            disabled={gameState?.isTimerRunning ?? !gameState?.wordRevealed ?? gameState?.hasChosen ?? isProcessing}
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