'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '~/components/ui/button';
import { FaMinus, FaPlus, FaPlay, FaPause } from 'react-icons/fa';
import { RiSkipForwardFill } from 'react-icons/ri';
import { api } from '~/trpc/react';
import type { Game } from '@prisma/client';

export default function GameClient({ game }: { game: Game }) {
  const router = useRouter();
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
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    if (!language) {
      router.replace('/');
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
          mistakes: wordsData.filter(w => w.outcome === 'sbagliata').length,
          wordsData,
        },
        {
          onSuccess: () => {
            router.push(`/stats/${game.id}`);
          },
        },
      );
    }
  }, [
    remainingTime,
    isPaused,
    game.id,
    passes,
    remainingPasses,
    router,
    score,
    updateGameResults,
    wordsData,
  ]);

  const handleCorrect = () => {
    if (isPaused && wordRevealed && !hasChosen) {
      setIsProcessing(true);
      setHasChosen(true);
      setTimeout(() => {
        setScore(score + 1);
        setIsProcessing(false);
        setWordsData([
          ...wordsData,
          {
            word: someWords.data?.[currentWordIndex] ?? '',
            outcome: 'indovinata',
          },
        ]);
      }, 500);
    }
  };

  const handleIncorrect = () => {
    if (isPaused && wordRevealed && !hasChosen) {
      setIsProcessing(true);
      setHasChosen(true);
      setTimeout(() => {
        setScore(Math.max(0, score - 1));
        setIsProcessing(false);
        setWordsData([
          ...wordsData,
          {
            word: someWords.data?.[currentWordIndex] ?? '',
            outcome: 'sbagliata',
          },
        ]);
      }, 500);
    }
  };

  const handlePass = () => {
    if (isPaused && wordRevealed && remainingPasses > 0 && !hasChosen) {
      setIsProcessing(true);
      setHasChosen(true);
      setTimeout(() => {
        setRemainingPasses(remainingPasses - 1);
        setIsProcessing(false);
        setWordsData([
          ...wordsData,
          {
            word: someWords.data?.[currentWordIndex] ?? '',
            outcome: 'passata',
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
    <div className="bg-main text-dark min-h-screen p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="text-3xl font-bold text-white">
            Speedy<span className="text-dark">Guesser</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden text-2xl font-bold sm:block">Tempo:</div>
            <div className="border-dark bg-second text-dark flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed font-mono text-5xl font-bold">
              {remainingTime}
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-center">
          <div className="border-dark bg-third text-dark flex h-20 w-full max-w-2xl items-center justify-center rounded-xl border-2 border-dashed font-mono text-4xl font-bold">
            {wordRevealed
              ? (someWords.data?.[currentWordIndex] ?? '')
              : '?????'}
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex w-1/4 flex-col items-center">
            <div className="text-2xl font-bold">Punteggio</div>
            <div className="border-dark bg-second text-dark mt-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed font-mono text-3xl font-bold">
              {score.toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex w-2/4 justify-center">
            <Button
              variant="personal"
              size="lg"
              onClick={togglePause}
              disabled={isPaused && wordRevealed && !hasChosen}
              className="bg-dark hover:bg-dark/80 flex h-32 w-32 items-center justify-center rounded-full text-6xl text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPaused ? <FaPlay /> : <FaPause />}
            </Button>
          </div>

          <div className="flex w-1/4 flex-col items-center">
            <div className="text-dark text-2xl font-bold">Passi</div>
            <div className="border-dark bg-second mt-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed font-mono text-3xl font-bold">
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
            className="bg-dark hover:bg-dark/80 flex h-24 w-24 items-center justify-center rounded-full text-4xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
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
            className="bg-dark hover:bg-dark/80 flex h-24 w-24 items-center justify-center rounded-full text-4xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RiSkipForwardFill />
          </Button>
          <Button
            variant="personal"
            size="lg"
            onClick={handleCorrect}
            disabled={!isPaused || !wordRevealed || hasChosen || isProcessing}
            className="bg-dark hover:bg-dark/80 flex h-24 w-24 items-center justify-center rounded-full text-4xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaPlus />
          </Button>
        </div>
      </div>
    </div>
  );
}
