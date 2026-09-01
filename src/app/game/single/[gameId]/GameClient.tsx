'use client';

import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import GameBoard from '~/app/_components/game/GameBoard';
import type { Game } from '@prisma/client';

export default function GameClient({ game }: { game: Game }) {
  const router = useRouter();
  const updateGameResults = api.game.updateGameResults.useMutation();
  const someWords = api.game.getRandomWords.useQuery(
    { language: game.language, count: 50 },
    { refetchOnWindowFocus: false },
  );

  if (!someWords.data) {
    return <div className="bg-main min-h-screen" />;
  }

  return (
    <GameBoard
      words={someWords.data}
      config={{
        language: game.language,
        timeLimit: game.timeLimit,
        pass: game.pass,
      }}
      onFinish={result => {
        updateGameResults.mutate(
          {
            gameId: game.id,
            score: result.score,
            passUsed: result.passUsed,
            mistakes: result.mistakes,
            wordsData: result.words.map(w => ({
              word: w.word,
              outcome: w.status,
            })),
          },
          {
            onSuccess: () => {
              router.push(`/stats/${game.id}`);
            },
          },
        );
      }}
    />
  );
}
