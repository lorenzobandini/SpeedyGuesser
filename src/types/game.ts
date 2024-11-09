export interface Room {
  id: string;
  code: string;
  gameType: string;
  status: string;
  language: string;
  timeLimit: number;
  pass: number;
  players: RoomPlayer[];
  game?: Game;
}

export interface RoomPlayer {
  id: string;
  role: string;
  userId: string;
  roomId: string;
  joinedAt?: Date;
  status: string;
}

export interface Game {
  id: string;
  roomId: string | null;
  userId: string | null;
  score: number;
  language: string;
  timeLimit: number;
  pass: number;
  passUsed: number;
  mistakes: number;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
  gameType: string;
};

export interface GameWord {
  id: string;
  gameId: string;
  word: Word;
  status: string;
  order: number;
}

export interface Word {
  id: string;
  word: string;
  language: string;
  difficulty?: number;
}

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