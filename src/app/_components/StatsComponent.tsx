'use client';

import { Button } from '~/components/ui/button';
import { ScrollArea } from '~/components/ui/scroll-area';
import { FaHome, FaRedo, FaCheck, FaTimes } from 'react-icons/fa';
import { MdOutlineSkipNext } from 'react-icons/md';
import type { StatsComponentProps } from '~/types/game';

export default function StatsComponent({
  stats,
  onRestart,
  onHome,
}: StatsComponentProps) {
  return (
    <div className="bg-main flex h-full flex-col p-4">
      <div className="flex grow flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-6 py-8">
          <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
            Punti totalizzati: <span className="text-dark">{stats.score}</span>
          </h1>
          <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h2 className="text-dark text-2xl font-bold">Statistiche</h2>
              <p className="text-dark text-lg">
                Passi Utilizzati: {stats.usedPasses} / {stats.totalPasses}
              </p>
              <p className="text-dark text-lg">
                Errori commessi: {stats.mistakes}
              </p>
              <p className="text-dark text-lg">
                Tempo medio per parola:{' '}
                {stats.totalTime && stats.wordsData.length > 0
                  ? (stats.totalTime / stats.wordsData.length).toFixed(2)
                  : 'N/A'}{' '}
                sec
              </p>
              <p className="text-dark text-lg">
                Tempo per punto:{' '}
                {stats.score > 0
                  ? (stats.totalTime / stats.score).toFixed(2)
                  : 'N/A'}{' '}
                sec
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-dark text-2xl font-bold">Parole giocate</h2>
              <ScrollArea className="border-dark h-48 w-full rounded-md border">
                <div className="p-2">
                  {stats.wordsData.map((wordData, index) => (
                    <div
                      key={index}
                      className="border-dark mb-1 flex items-center justify-between border-b pb-1"
                    >
                      <span className="text-dark font-medium">
                        {wordData.word}
                      </span>
                      {wordData.status === 'CORRECT' ? (
                        <FaCheck className="text-xl text-green-500" />
                      ) : wordData.status === 'WRONG' ? (
                        <FaTimes className="text-xl text-red-500" />
                      ) : (
                        <MdOutlineSkipNext className="text-xl text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Button
              onClick={onRestart}
              variant="personal"
              size="lg"
              className="flex items-center justify-center gap-2"
            >
              <FaRedo />
              <span>Ricomincia</span>
            </Button>
            <Button
              onClick={onHome}
              variant="personal"
              size="lg"
              className="flex items-center justify-center gap-2"
            >
              <FaHome />
              <span>Home</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
