import { describe, expect, it } from 'vitest';
import {
  canStart,
  isOnline,
  nextRoundCounters,
  shuffleWords,
} from '~/lib/room-logic';

const ready = (role: string | null, isReady = true) => ({ role, isReady });

describe('canStart', () => {
  it('starts with exactly 2 HINTER + 1 GUESSER all ready', () => {
    expect(canStart([ready('HINTER'), ready('HINTER'), ready('GUESSER')])).toBe(
      true,
    );
  });

  it('fails when someone is not ready', () => {
    expect(
      canStart([ready('HINTER'), ready('HINTER', false), ready('GUESSER')]),
    ).toBe(false);
  });

  it('fails with unassigned roles', () => {
    expect(canStart([ready('HINTER'), ready(null), ready('GUESSER')])).toBe(
      false,
    );
  });

  it('fails with duplicate guesser', () => {
    expect(
      canStart([ready('GUESSER'), ready('GUESSER'), ready('HINTER')]),
    ).toBe(false);
  });

  it('fails with wrong player count', () => {
    expect(
      canStart([
        ready('HINTER'),
        ready('HINTER'),
        ready('GUESSER'),
        ready(null),
      ]),
    ).toBe(false);
    expect(canStart([ready('HINTER'), ready('GUESSER')])).toBe(false);
  });
});

describe('shuffleWords', () => {
  it('keeps all elements', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleWords(items);
    expect(shuffled).toHaveLength(items.length);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
  });

  it('does not mutate the input', () => {
    const items = [1, 2, 3];
    shuffleWords(items);
    expect(items).toEqual([1, 2, 3]);
  });
});

describe('isOnline', () => {
  it('is online within the 10s window', () => {
    const now = Date.now();
    expect(isOnline(new Date(now - 5_000), now)).toBe(true);
  });

  it('is offline beyond the 10s window', () => {
    const now = Date.now();
    expect(isOnline(new Date(now - 60_000), now)).toBe(false);
  });

  it('accepts ISO strings', () => {
    const now = Date.now();
    expect(isOnline(new Date(now - 1_000).toISOString(), now)).toBe(true);
  });
});

describe('nextRoundCounters', () => {
  const base = { score: 5, mistakes: 1, passUsed: 2 };

  it('CORRECT increments score', () => {
    expect(nextRoundCounters(base, 'CORRECT')).toEqual({
      score: 6,
      mistakes: 1,
      passUsed: 2,
    });
  });

  it('WRONG clamps score at 0 and increments mistakes', () => {
    expect(nextRoundCounters(base, 'WRONG')).toEqual({
      score: 4,
      mistakes: 2,
      passUsed: 2,
    });
    expect(nextRoundCounters({ ...base, score: 0 }, 'WRONG')).toEqual({
      score: 0,
      mistakes: 2,
      passUsed: 2,
    });
  });

  it('PASSED increments passUsed', () => {
    expect(nextRoundCounters(base, 'PASSED')).toEqual({
      score: 5,
      mistakes: 1,
      passUsed: 3,
    });
  });
});
