import * as fc from 'fast-check';
import { CARD_SIZE, MAX_NUMBER } from '@/lib/bingo';
import type { GameState } from '@/lib/types';

export const bingoNumber = () => fc.integer({ min: 1, max: MAX_NUMBER });

export const bingoNumbers = (count: number) =>
  fc.uniqueArray(bingoNumber(), { minLength: count, maxLength: count });

export const card = () =>
  bingoNumbers(CARD_SIZE).map((nums) => [...nums].sort((a, b) => a - b));

export const drawnNumbers = () =>
  fc.uniqueArray(bingoNumber(), { minLength: 0, maxLength: MAX_NUMBER });

export const adminId = () => fc.string({ minLength: 8, maxLength: 32 });

export const adminSession = () =>
  fc.record({
    isAuthenticated: fc.boolean(),
    adminId: adminId(),
  });

export const gameState = () =>
  fc.constantFrom<GameState>('waiting', 'in_progress', 'completed');

export const player = () =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    cardNumbers: bingoNumbers(CARD_SIZE),
    markedNumbers: fc.uniqueArray(bingoNumber(), {
      minLength: 0,
      maxLength: CARD_SIZE,
    }),
    joinedAt: fc.integer({ min: 0 }),
  });

export const winner = () =>
  fc.record({
    playerId: fc.string({ minLength: 1, maxLength: 50 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    round: fc.integer({ min: 1, max: 100 }),
    timestamp: fc.integer({ min: 0 }),
  });

export const room = () =>
  fc.record({
    id: fc.string({ minLength: 4, maxLength: 6 }),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    adminId: fc.string({ minLength: 1, maxLength: 50 }),
    createdAt: fc.integer({ min: 0 }),
    gameState: gameState(),
    currentRound: fc.integer({ min: 1, max: 100 }),
    players: fc.dictionary(fc.string({ minLength: 1 }), player(), {
      maxKeys: 10,
    }),
    drawnNumbers: drawnNumbers(),
    winners: fc.array(winner(), { maxLength: 10 }),
  });
