import * as fc from "fast-check";
import type { GameState, Room } from "@/lib/types";

export const bingoNumber = () => fc.integer({ min: 1, max: 100 });

export const bingoNumbers = (count: number) =>
  fc.uniqueArray(bingoNumber(), { minLength: count, maxLength: count });

export const cartela = () =>
  bingoNumbers(20).map((nums) => [...nums].sort((a, b) => a - b));

export const numerosSorteados = () =>
  fc.uniqueArray(bingoNumber(), { minLength: 0, maxLength: 100 });

export const adminId = () => fc.string({ minLength: 8, maxLength: 32 });

export const adminSession = () =>
  fc.record({
    isAuthenticated: fc.boolean(),
    adminId: adminId(),
  });

// Room generators for admin dashboard
export const gameState = () =>
  fc.constantFrom<GameState>("waiting", "in_progress", "completed");

export const player = () =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    cardNumbers: fc.uniqueArray(fc.integer({ min: 1, max: 100 }), {
      minLength: 20,
      maxLength: 20,
    }),
    markedNumbers: fc.uniqueArray(fc.integer({ min: 1, max: 100 }), {
      minLength: 0,
      maxLength: 20,
    }),
    joinedAt: fc.integer({ min: 0 }),
  });

export const room = () =>
  fc.record({
    id: fc.string({ minLength: 4, maxLength: 6 }),
    createdAt: fc.integer({ min: 0 }),
    gameState: gameState(),
    adminId: fc.string({ minLength: 1, maxLength: 50 }),
    players: fc.dictionary(fc.string({ minLength: 1 }), player(), {
      maxKeys: 10,
    }),
    drawnNumbers: fc.uniqueArray(fc.integer({ min: 1, max: 100 }), {
      minLength: 0,
      maxLength: 100,
    }),
  });
