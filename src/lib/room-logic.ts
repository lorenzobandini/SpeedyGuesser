import type { Verdict } from '~/lib/game-logic';

export type RoomRole = 'HINTER' | 'GUESSER';

export interface PlayerRoleState {
  role: string | null;
  isReady: boolean;
}

/** TV format: a room starts only with exactly 2 HINTER + 1 GUESSER, all ready. */
export function canStart(players: PlayerRoleState[]): boolean {
  return (
    players.length === 3 &&
    players.filter(p => p.role === 'HINTER').length === 2 &&
    players.filter(p => p.role === 'GUESSER').length === 1 &&
    players.every(p => p.isReady)
  );
}

/** Fisher-Yates shuffle, returns a new array. */
export function shuffleWords<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

const PRESENCE_WINDOW_MS = 10_000;

/** A player counts as online if their last heartbeat is recent enough. */
export function isOnline(
  lastSeenAt: Date | string,
  now: number = Date.now(),
): boolean {
  return now - new Date(lastSeenAt).getTime() < PRESENCE_WINDOW_MS;
}

/** Score changes mirroring applyVerdict() from game-logic, for server-side persistence. */
export function nextRoundCounters(
  counters: { score: number; mistakes: number; passUsed: number },
  verdict: Verdict,
): { score: number; mistakes: number; passUsed: number } {
  switch (verdict) {
    case 'CORRECT':
      return {
        score: counters.score + 1,
        mistakes: counters.mistakes,
        passUsed: counters.passUsed,
      };
    case 'WRONG':
      return {
        score: Math.max(0, counters.score - 1),
        mistakes: counters.mistakes + 1,
        passUsed: counters.passUsed,
      };
    case 'PASSED':
      return {
        score: counters.score,
        mistakes: counters.mistakes,
        passUsed: counters.passUsed + 1,
      };
  }
}
