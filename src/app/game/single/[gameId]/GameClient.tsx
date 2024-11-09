"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { FaMinus, FaPlus, FaPlay, FaPause } from "react-icons/fa";
import { RiSkipForwardFill } from "react-icons/ri";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import type { Game } from "~/types/game";

export default function GameClient({ game }: { game : Game }) {
  const router = useRouter();
  const { toast } = useToast();
  const language = game.language;
  const timeLimit = game.timeLimit.toString();
  const passes = game.pass.toString();
  const updateGameResults = api.game.updateGameResults.useMutation();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(parseInt(timeLimit));
  const [remainingPasses, setRemainingPasses] = useState(parseInt(passes));
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [wordRevealed, setWordRevealed] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wordsData, setWordsData] = useState<
    { word: string; outcome: string }[]
  >([]);

  const someWords = api.game.getRandomWords.useQuery(
    { language, count: 50 },
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (!language) {
      router.replace("/");
      return;
    }
  }, [language, router]);

  useEffect(() => {
    if (remainingTime > 0 && !isPaused) {
      const timer = setTimeout(() => setRemainingTime(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [remainingTime, isPaused]);

  useEffect(() => {
    if (remainingTime === 0 && !isPaused) {
      setIsPaused(true);
      updateGameResults.mutate(
        {
          gameId: game.id,
          score,
          passUsed: parseInt(passes) - remainingPasses,
          mistakes: wordsData.filter((w) => w.outcome === "sbagliata").length,
          wordsData,
        },
        {
          onSuccess: () => {
            router.push(`/stats/${game.id}`);
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
  }, [remainingTime, isPaused, game.id, passes, remainingPasses, router, score, toast, updateGameResults, wordsData]);

  const handleCorrect = () => {
    if (isPaused && wordRevealed && !hasChosen) {
      setIsProcessing(true);
      setTimeout(() => {
        setScore(score + 1);
        setHasChosen(true);
        setIsProcessing(false);
        toast({
          title: "Correct!",
          description: "You've earned a point.",
          variant: "success",
        });
        setWordsData([
          ...wordsData,
          {
            word: someWords.data?.[currentWordIndex] ?? "",
            outcome: "indovinata",
          },
        ]);
      }, 500);
    }
  };

  const handleIncorrect = () => {
    if (isPaused && wordRevealed && !hasChosen) {
      setIsProcessing(true);
      setTimeout(() => {
        setScore(Math.max(0, score - 1));
        setHasChosen(true);
        setIsProcessing(false);
        toast({
          title: "Incorrect",
          description: "You've lost a point.",
          variant: "destructive",
        });
        setWordsData([
          ...wordsData,
          {
            word: someWords.data?.[currentWordIndex] ?? "",
            outcome: "sbagliata",
          },
        ]);
      }, 500);
    }
  };

  const handlePass = () => {
    if (isPaused && wordRevealed && remainingPasses > 0 && !hasChosen) {
      setIsProcessing(true);
      setTimeout(() => {
        setRemainingPasses(remainingPasses - 1);
        setHasChosen(true);
        setIsProcessing(false);
        toast({
          title: "Passed",
          description: "You've used a pass.",
          variant: "info",
        });
        setWordsData([
          ...wordsData,
          {
            word: someWords.data?.[currentWordIndex] ?? "",
            outcome: "passata",
          },
        ]);
      }, 500);
    }
  };

  const nextWord = () => {
    if (someWords.data && currentWordIndex < someWords.data.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setCurrentWordIndex(0);
    }
    setHasChosen(false);
  };

  const togglePause = () => {
    if (isPaused) {
      if (wordRevealed && !hasChosen) {
        toast({
          title: "Action Required",
          description: "You must choose an option before continuing!",
          variant: "warning",
        });
        return;
      }
      setWordRevealed(true);
      nextWord();
      setIsPaused(false);
    } else {
      setIsPaused(true);
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
            <div className="text-2xl font-bold hidden sm:block">Tempo:</div>
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
          <div className="flex flex-col items-center w-1/4">
            <div className="text-2xl font-bold">Punteggio</div>
            <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-dark bg-second font-mono text-3xl font-bold text-dark">
              {score.toString().padStart(2, "0")}
            </div>
          </div>

          <div className="flex justify-center w-2/4">
          <Button
            variant="personal"
            size="lg"
            onClick={togglePause}
              className="flex h-32 w-32 items-center justify-center rounded-full bg-dark text-6xl text-white transition-colors hover:bg-dark/80"
          >
            {isPaused ? <FaPlay /> : <FaPause />}
          </Button>
          </div>

          <div className="flex flex-col items-center w-1/4">
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