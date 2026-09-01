'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '~/trpc/react';
import GameBoard from '~/app/_components/game/GameBoard';
import StatsComponent from '~/app/_components/StatsComponent';
import type { GameResult } from '~/lib/game-logic';

const validLanguages = ['IT', 'EN'];
const validTimes = ['45', '60', '90'];
const validPasses = ['0', '1', '3', '5'];

export default function GamePage() {
  return (
    <Suspense>
      <Game />
    </Suspense>
  );
}

function Game() {
  const router = useRouter();
  const searchParams = useSearchParams();
  let language = searchParams?.get('language') ?? 'IT';
  const time = searchParams?.get('time') ?? '60';
  const passes = searchParams?.get('passes') ?? '3';

  if (!validLanguages.includes(language)) language = 'IT';

  const [restartKey, setRestartKey] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const someWords = api.game.getRandomWords.useQuery(
    { language, count: 50 },
    { refetchOnWindowFocus: false },
  );

  const paramsValid =
    validTimes.includes(time) &&
    validPasses.includes(passes) &&
    searchParams?.has('time') &&
    searchParams?.has('passes') &&
    searchParams?.has('language');

  useEffect(() => {
    if (!paramsValid) {
      router.replace('/game/offline/play?language=IT&time=60&passes=3');
    }
  }, [paramsValid, router]);

  if (!paramsValid || !someWords.data) {
    return <div className="bg-main min-h-screen" />;
  }

  if (result) {
    return (
      <StatsComponent
        stats={{
          score: result.score,
          totalPasses: parseInt(passes),
          usedPasses: result.passUsed,
          totalTime: parseInt(time),
          mistakes: result.mistakes,
          wordsData: result.words,
        }}
        onRestart={() => {
          setResult(null);
          setRestartKey(k => k + 1);
          void someWords.refetch();
        }}
        onHome={() => router.push('/')}
      />
    );
  }

  return (
    <GameBoard
      key={restartKey}
      words={someWords.data}
      config={{
        language,
        timeLimit: parseInt(time),
        pass: parseInt(passes),
      }}
      onFinish={setResult}
    />
  );
}
