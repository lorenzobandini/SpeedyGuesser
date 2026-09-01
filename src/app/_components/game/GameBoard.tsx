'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import { FaMinus, FaPause, FaPlay, FaPlus } from 'react-icons/fa';
import { RiSkipForwardFill } from 'react-icons/ri';
import {
  advanceWord,
  applyVerdict,
  initRound,
  isRoundOver,
  toResult,
  type GameConfig,
  type GameResult,
} from '~/lib/game-logic';

/** Presentational pieces shared with the online mode (Room round). */

export function GameTimer({ time }: { time: number }) {
  return (
    <div className="border-dark bg-second text-dark flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed font-mono text-5xl font-bold">
      {time}
    </div>
  );
}

export function WordCard({
  word,
  revealed,
}: {
  word: string;
  revealed: boolean;
}) {
  return (
    <div className="border-dark bg-third text-dark flex h-20 w-full max-w-2xl items-center justify-center rounded-xl border-2 border-dashed font-mono text-4xl font-bold">
      {revealed ? word : '?????'}
    </div>
  );
}

export function ScoreBar({
  score,
  passes,
  children,
}: {
  score: number;
  passes: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex w-1/4 flex-col items-center">
        <div className="text-2xl font-bold">Punteggio</div>
        <div className="border-dark bg-second text-dark mt-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed font-mono text-3xl font-bold">
          {score.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex w-2/4 justify-center">{children}</div>

      <div className="flex w-1/4 flex-col items-center">
        <div className="text-dark text-2xl font-bold">Passi</div>
        <div className="border-dark bg-second mt-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed font-mono text-3xl font-bold">
          {passes}
        </div>
      </div>
    </div>
  );
}

function GameHeader({ time }: { time: number }) {
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

interface GameBoardProps {
  words: string[];
  config: GameConfig;
  onFinish: (result: GameResult) => void;
  role?: 'guesser' | 'hinter';
}

export default function GameBoard({
  words,
  config,
  onFinish,
  role = 'guesser',
}: GameBoardProps) {
  const [round, setRound] = useState(() => initRound(config, words));
  const [isPaused, setIsPaused] = useState(true);
  const [wordRevealed, setWordRevealed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const hasChosen = round.results.length > round.currentIndex;
  const isHinter = role === 'hinter';

  useEffect(() => {
    if (isPaused || finishedRef.current) return;
    const timer = setInterval(() => {
      setRound(prev => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    if (!isRoundOver(round) || finishedRef.current) return;
    finishedRef.current = true;
    setIsPaused(true);
    onFinishRef.current(toResult(round));
  }, [round]);

  const togglePause = () => {
    if (isPaused) {
      if (wordRevealed && !hasChosen) return;
      setWordRevealed(true);
      setRound(prev => advanceWord(prev, words));
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  };

  const handleVerdict = (verdict: 'CORRECT' | 'WRONG' | 'PASSED') => {
    if (isProcessing || isPaused !== true || !wordRevealed || hasChosen) return;
    setIsProcessing(true);
    setTimeout(() => {
      setRound(prev => applyVerdict(prev, verdict));
      setIsProcessing(false);
    }, 500);
  };

  if (isHinter) {
    return (
      <div className="bg-main text-dark min-h-screen p-4">
        <div className="mx-auto max-w-6xl">
          <GameHeader time={round.timeRemaining} />
          <div className="mb-8 flex items-center justify-center">
            <WordCard word={round.currentWord} revealed />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-main text-dark min-h-screen p-4">
      <div className="mx-auto max-w-6xl">
        <GameHeader time={round.timeRemaining} />

        <div className="mb-8 flex items-center justify-center">
          <WordCard word={round.currentWord} revealed={wordRevealed} />
        </div>

        <ScoreBar score={round.score} passes={round.passLimit - round.passUsed}>
          <Button
            variant="personal"
            size="lg"
            onClick={togglePause}
            disabled={isPaused && wordRevealed && !hasChosen}
            className="bg-dark hover:bg-dark/80 flex h-32 w-32 items-center justify-center rounded-full text-6xl text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPaused ? <FaPlay /> : <FaPause />}
          </Button>
        </ScoreBar>

        <div className="flex justify-center gap-8">
          <Button
            variant="personal"
            size="lg"
            onClick={() => handleVerdict('WRONG')}
            disabled={!isPaused || !wordRevealed || hasChosen || isProcessing}
            className="bg-dark hover:bg-dark/80 flex h-24 w-24 items-center justify-center rounded-full text-4xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaMinus />
          </Button>
          <Button
            variant="personal"
            size="lg"
            onClick={() => handleVerdict('PASSED')}
            disabled={
              round.passUsed === round.passLimit ||
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
            onClick={() => handleVerdict('CORRECT')}
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
