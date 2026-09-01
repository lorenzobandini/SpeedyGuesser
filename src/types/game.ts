export interface StatsComponentProps {
  stats: {
    score: number;
    totalTime: number;
    totalPasses: number;
    usedPasses: number;
    mistakes: number;
    wordsData: { word: string; outcome: string }[];
  };
  onRestart: () => void;
  onHome: () => void;
}
