"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { FaMinus, FaPlus, FaPlay, FaPause } from "react-icons/fa";
import { RiSkipForwardFill } from "react-icons/ri";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";

const validLanguages = ["IT", "EN"];
const validTimes = ["45", "60", "90"];
const validPasses = ["0", "1", "3", "5"];

export default function Game() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const language = searchParams.get("language") ?? "IT";
  const time = searchParams.get("time") ?? "60";
  const passes = searchParams.get("passes") ?? "3";

  useEffect(() => {
    console.log("useEffect for validation");
    if (
      !validLanguages.includes(language) ||
      !validTimes.includes(time) ||
      !validPasses.includes(passes)
    ) {
      router.replace("/game?language=IT&time=60&passes=3");
    }
  }, [language, time, passes, router]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(parseInt(time));
  const [remainingPasses, setRemainingPasses] = useState(parseInt(passes));
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [wordRevealed, setWordRevealed] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const someWords = api.game.getRandomWords.useQuery({ language, count: 30 });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (remainingTime > 0 && !isPaused) {
      timer = setTimeout(() => setRemainingTime(remainingTime - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [remainingTime, isPaused]);

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
    <>
      <div className="flex h-full flex-col bg-main p-4 text-dark">
        <div className="mb-4 text-right text-3xl font-bold">Tempo</div>
        <div className="mb-8 flex items-center justify-between">
          <div className="w-1/6"></div>
          <div className="flex w-4/6 justify-center">
            <div className="flex h-20 w-full max-w-2xl items-center justify-center rounded-xl border-2 border-dashed border-dark bg-third font-mono text-4xl font-bold text-dark">
              {wordRevealed ? (someWords.data ? someWords.data[currentWordIndex] : "") : "?????"}
            </div>
          </div>
          <div className="flex w-1/6 justify-end pe-2">
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-dark bg-second font-mono text-5xl font-bold text-dark">
                {remainingTime}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex flex-1 flex-col items-center">
            <div className="text-2xl font-bold">Punteggio</div>
            <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-dark bg-second font-mono text-3xl font-bold text-dark">
              {score.toString().padStart(2, "0")}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <Button
              variant="personal"
              size="lg"
              onClick={togglePause}
              className="mx-4 flex h-32 w-32 items-center justify-center rounded-full bg-dark text-6xl text-white hover:bg-dark/80 transition-colors"
            >
              {isPaused ? <FaPlay /> : <FaPause />}
            </Button>
          </div>

          <div className="flex flex-1 flex-col items-center">
            <div className="text-2xl font-bold text-dark">Passi</div>
            <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-dark bg-second font-mono text-3xl font-bold">
              {remainingPasses}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="personal"
            size="lg"
            onClick={handleIncorrect}
            disabled={!isPaused || !wordRevealed || hasChosen || isProcessing}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-dark text-4xl text-white hover:bg-dark/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FaMinus />
          </Button>
          <Button
            variant="personal"
            size="lg"
            onClick={handlePass}
            disabled={remainingPasses === 0 || !isPaused || !wordRevealed || hasChosen || isProcessing}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-dark text-4xl text-white hover:bg-dark/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RiSkipForwardFill />
          </Button>
          <Button
            variant="personal"
            size="lg"
            onClick={handleCorrect}
            disabled={!isPaused || !wordRevealed || hasChosen || isProcessing}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-dark text-4xl text-white hover:bg-dark/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FaPlus />
          </Button>
        </div>
      </div>
      <Toaster />
    </>
  );
}