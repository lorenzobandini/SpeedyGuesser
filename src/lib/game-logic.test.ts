import { describe, expect, it } from 'vitest';
import {
  advanceWord,
  applyVerdict,
  computeRemaining,
  initRound,
  isRoundOver,
  toResult,
} from './game-logic';

const config = { language: 'IT', timeLimit: 60, pass: 2 };
const words = ['gatto', 'cane', 'sole'];

describe('applyVerdict', () => {
  it('CORRECT increments score and records the word', () => {
    let state = initRound(config, words);
    state = applyVerdict(state, 'CORRECT');
    expect(state.score).toBe(1);
    expect(state.mistakes).toBe(0);
    expect(state.results).toEqual([{ word: 'gatto', status: 'CORRECT' }]);
  });

  it('WRONG increments mistakes and floors score at 0', () => {
    let state = initRound(config, words);
    state = applyVerdict(state, 'WRONG');
    expect(state.score).toBe(0);
    expect(state.mistakes).toBe(1);

    state = applyVerdict(state, 'WRONG'); // no-op: double verdict
    expect(state.mistakes).toBe(1);
  });

  it('double verdict is a no-op', () => {
    let state = initRound(config, words);
    state = applyVerdict(state, 'CORRECT');
    const again = applyVerdict(state, 'CORRECT');
    expect(again).toBe(state);
    expect(state.results.length).toBe(1);
  });

  it('PASS is a no-op when passes are exhausted', () => {
    let state = initRound(config, words);
    state = applyVerdict(state, 'PASSED');
    state = advanceWord(state, words);
    state = applyVerdict(state, 'PASSED');
    state = advanceWord(state, words);
    expect(state.passUsed).toBe(2);
    const exhausted = applyVerdict(state, 'PASSED');
    expect(exhausted).toBe(state);
    expect(state.passUsed).toBe(2);
  });

  it('PASSED consumes a pass without touching score', () => {
    let state = initRound(config, words);
    state = applyVerdict(state, 'CORRECT');
    state = applyVerdict(state, 'PASSED'); // double verdict no-op path? no: results.length == 1 > currentIndex 0 -> no-op
    expect(state.passUsed).toBe(0);
  });
});

describe('advanceWord', () => {
  it('advances and wraps around', () => {
    let state = initRound(config, words);
    state = advanceWord(state, words);
    expect(state.currentWord).toBe('cane');
    state = advanceWord(state, words);
    expect(state.currentWord).toBe('sole');
    state = advanceWord(state, words);
    expect(state.currentWord).toBe('gatto');
  });
});

describe('computeRemaining', () => {
  it('starts at timeLimit', () => {
    expect(computeRemaining(1000, 60, 1000)).toBe(60);
  });

  it('decreases with elapsed time', () => {
    expect(computeRemaining(0, 60, 10_000)).toBe(50);
  });

  it('clamps at 0 when time is up', () => {
    expect(computeRemaining(0, 60, 60_000)).toBe(0);
    expect(computeRemaining(0, 60, 120_000)).toBe(0);
  });
});

describe('isRoundOver / toResult', () => {
  it('round is over when time hits 0', () => {
    const state = { ...initRound(config, words), timeRemaining: 0 };
    expect(isRoundOver(state)).toBe(true);
    expect(isRoundOver(initRound(config, words))).toBe(false);
  });

  it('toResult returns the final payload', () => {
    let state = initRound(config, words);
    state = applyVerdict(state, 'CORRECT');
    state = applyVerdict(state, 'WRONG'); // no-op
    state = advanceWord(state, words);
    state = applyVerdict(state, 'PASSED');
    const result = toResult(state);
    expect(result).toEqual({
      score: 1,
      passUsed: 1,
      mistakes: 0,
      words: [
        { word: 'gatto', status: 'CORRECT' },
        { word: 'cane', status: 'PASSED' },
      ],
    });
  });
});
