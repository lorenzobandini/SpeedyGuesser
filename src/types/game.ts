import type { GameType, WordStatus, PlayerRole, GameStatus, Language } from './enums';

export interface Room {
  id: string;
  code: string;
  gameType: GameType;
  status: GameStatus;
  language: Language;
  timeLimit: number;
  pass: number;
  players: RoomPlayer[];
  game?: Game;
}

export interface RoomPlayer {
  id: string;
  role: PlayerRole;
  userId: string;
  roomId: string;
  joinedAt?: Date;
  status: string;
}

export interface Game {
  id: string;
  roomId: string;
  score: number;
  startedAt?: Date;
  endedAt?: Date;
  words: GameWord[];
}

export interface GameWord {
  id: string;
  gameId: string;
  word: Word;
  status: WordStatus;
  order: number;
}

export interface Word {
  id: string;
  word: string;
  language: Language;
  difficulty?: number;
}