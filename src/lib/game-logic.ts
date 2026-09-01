export type Verdict = 'CORRECT' | 'WRONG' | 'PASSED';

export interface GameConfig {
  language: string;
  timeLimit: number;
  pass: number;
}

export interface WordResult {
  word: string;
  status: Verdict;
}

export interface GameResult {
  score: number;
  passUsed: number;
  mistakes: number;
  words: WordResult[];
}

export interface RoundState {
  currentIndex: number;
  currentWord: string;
  score: number;
  mistakes: number;
  passUsed: number;
  passLimit: number;
  timeRemaining: number;
  results: WordResult[];
}

export function initRound(config: GameConfig, words: string[]): RoundState {
  return {
    currentIndex: 0,
    currentWord: words[0] ?? '',
    score: 0,
    mistakes: 0,
    passUsed: 0,
    passLimit: config.pass,
    timeRemaining: config.timeLimit,
    results: [],
  };
}

/**
 * Apply a verdict to the current word. Idempotent per word: answering the same
 * word twice (or passing with no passes left) returns the state unchanged.
 */
export function applyVerdict(state: RoundState, verdict: Verdict): RoundState {
  // A verdict was already recorded for the current word.
  if (state.results.length > state.currentIndex) return state;
  if (verdict === 'PASSED' && state.passUsed >= state.passLimit) return state;

  const result: WordResult = { word: state.currentWord, status: verdict };
  switch (verdict) {
    case 'CORRECT':
      return {
        ...state,
        score: state.score + 1,
        results: [...state.results, result],
      };
    case 'WRONG':
      return {
        ...state,
        mistakes: state.mistakes + 1,
        score: Math.max(0, state.score - 1),
        results: [...state.results, result],
      };
    case 'PASSED':
      return {
        ...state,
        passUsed: state.passUsed + 1,
        results: [...state.results, result],
      };
  }
}

export function advanceWord(state: RoundState, words: string[]): RoundState {
  const nextIndex =
    state.currentIndex < words.length - 1 ? state.currentIndex + 1 : 0;
  return {
    ...state,
    currentIndex: nextIndex,
    currentWord: words[nextIndex] ?? '',
  };
}

export function isRoundOver(state: RoundState): boolean {
  return state.timeRemaining <= 0;
}

/** Seconds left in the round, clamped to [0, timeLimit]. */
export function computeRemaining(
  startedAt: number,
  timeLimit: number,
  now: number,
): number {
  const elapsedMs = Math.max(0, now - startedAt);
  return Math.max(
    0,
    Math.min(timeLimit, Math.ceil(timeLimit - elapsedMs / 1000)),
  );
}

export function toResult(state: RoundState): GameResult {
  return {
    score: state.score,
    passUsed: state.passUsed,
    mistakes: state.mistakes,
    words: state.results,
  };
}
