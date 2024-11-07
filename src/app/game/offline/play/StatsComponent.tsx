"use client";

import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { FaHome, FaRedo, FaCheck, FaTimes } from "react-icons/fa";
import { MdOutlineSkipNext } from "react-icons/md";

interface StatsComponentProps {
  stats: {
    score: number;
    totalPasses: number;
    usedPasses: number;
    averageTimePerWord: number;
    mistakes: number;
    wordsData: { word: string; outcome: string }[];
  };
  onRestart: () => void;
  onHome: () => void;
}

export default function StatsComponent({
  stats,
  onRestart,
  onHome,
}: StatsComponentProps) {
  return (
    <div className="flex h-full flex-col bg-main p-4">
      <div className="flex flex-grow flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-6 py-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-center">
            Punti totalizzati: <span className="text-dark">{stats.score}</span>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-dark">Statistiche</h2>
              <p className="text-lg text-dark">
                Passi: {stats.usedPasses} / {stats.totalPasses}
              </p>
              <p className="text-lg text-dark">
                Tempo medio: {stats.averageTimePerWord ? stats.averageTimePerWord.toFixed(2) : 'N/A'} sec
              </p>
              <p className="text-lg text-dark">Errori: {stats.mistakes}</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-dark">Parole giocate</h2>
              <ScrollArea className="h-48 w-full rounded-md border border-dark">
                <div className="p-2">
                  {stats.wordsData.map((wordData, index) => (
                    <div
                      key={index}
                      className="mb-1 flex justify-between items-center border-b border-dark pb-1"
                    >
                      <span className="font-medium text-dark">{wordData.word}</span>
                      {wordData.outcome === "indovinata" ? (
                        <FaCheck className="text-green-500 text-xl" />
                      ) : wordData.outcome === "sbagliata" ? (
                        <FaTimes className="text-red-500 text-xl" />
                      ) : (
                        <MdOutlineSkipNext className="text-yellow-500 text-xl" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
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