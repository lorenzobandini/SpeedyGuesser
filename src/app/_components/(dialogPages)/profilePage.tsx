'use client'

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";

interface ProfileContentProps {
  closeDialog: () => void;
}

export default function ProfileContent({ closeDialog }: ProfileContentProps) {
  const router = useRouter();

  const { data: stats } = api.game.getUserStatistics.useQuery();
  const { data: lastGames } = api.game.getUserLastGames.useQuery();

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Partite Giocate</h3>
          <p className="text-dark">{stats?.gamesPlayed ?? 0}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Punteggio Più Alto</h3>
          <p className="text-dark">{stats?.highestScore ?? 0}</p>
        </div>
      </div>

      <h3 className="mt-6 text-lg font-semibold">Cronologia Partite</h3>
      <ScrollArea className="mt-4 h-64">
        <ul>
          {lastGames?.map((game) => (
            <li key={game.id} className="mb-4 flex justify-between items-center">
              <div>
                <p className="text-dark">
                  {game.language} - {game.timeLimit}s - Pass: {game.pass}
                </p>
                <p className="text-dark text-sm">
                  Punteggio: {game.score} - Errori: {game.mistakes}
                </p>
              </div>
              <Button onClick={() => { 
                closeDialog();
                router.push(`/stats/${game.id}`); 
              }}>
                Dettagli
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </>
  );
}
