import type { WordResult } from '~/lib/game-logic';

export interface StatsComponentProps {
  stats: {
    score: number;
    totalTime: number;
    totalPasses: number;
    usedPasses: number;
    mistakes: number;
    wordsData: WordResult[];
  };
  onRestart: () => void;
  onHome: () => void;
}
