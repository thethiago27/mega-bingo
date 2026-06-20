import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { MAX_NUMBER } from '@/lib/bingo';
import type { GameState, Player, Room, Winner } from '@/lib/types';

// Generators for Room data
const gameStateArbitrary = () =>
  fc.constantFrom<GameState>('waiting', 'in_progress', 'completed');

const playerArbitrary = (): fc.Arbitrary<Player> =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    cardNumbers: fc.uniqueArray(fc.integer({ min: 1, max: MAX_NUMBER }), {
      minLength: 10,
      maxLength: 10,
    }),
    markedNumbers: fc.uniqueArray(fc.integer({ min: 1, max: MAX_NUMBER }), {
      minLength: 0,
      maxLength: 10,
    }),
    joinedAt: fc.integer({ min: 0 }),
  });

const winnerArbitrary = (): fc.Arbitrary<Winner> =>
  fc.record({
    playerId: fc.string({ minLength: 1, maxLength: 50 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    round: fc.integer({ min: 1, max: 100 }),
    timestamp: fc.integer({ min: 0 }),
  });

const roomArbitrary = (): fc.Arbitrary<Room> =>
  fc.record({
    id: fc.string({ minLength: 4, maxLength: 6 }),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    adminId: fc.string({ minLength: 1, maxLength: 50 }),
    createdAt: fc.integer({ min: 0 }),
    gameState: gameStateArbitrary(),
    currentRound: fc.integer({ min: 1, max: 100 }),
    players: fc.dictionary(fc.string({ minLength: 1 }), playerArbitrary(), {
      maxKeys: 10,
    }),
    drawnNumbers: fc.uniqueArray(fc.integer({ min: 1, max: MAX_NUMBER }), {
      minLength: 0,
      maxLength: MAX_NUMBER,
    }),
    winners: fc.array(winnerArbitrary(), { maxLength: 10 }),
  });

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'ABC123',
    name: 'Sala do Admin',
    adminId: 'admin-1',
    createdAt: Date.now(),
    gameState: 'waiting',
    currentRound: 1,
    players: {},
    drawnNumbers: [],
    winners: [],
    ...overrides,
  };
}

describe('Room Data Model', () => {
  describe('GameState Type', () => {
    it('should only allow valid game states', () => {
      const validStates: GameState[] = ['waiting', 'in_progress', 'completed'];

      validStates.forEach((state) => {
        const room = makeRoom({ gameState: state });
        expect(room.gameState).toBe(state);
      });
    });
  });

  it('Property: Room serialization preserves data', () => {
    fc.assert(
      fc.property(roomArbitrary(), (room: Room) => {
        const serialized = JSON.stringify(room);
        const deserialized = JSON.parse(serialized) as Room;

        expect(deserialized.id).toBe(room.id);
        expect(deserialized.name).toBe(room.name);
        expect(deserialized.adminId).toBe(room.adminId);
        expect(deserialized.createdAt).toBe(room.createdAt);
        expect(deserialized.gameState).toBe(room.gameState);
        expect(deserialized.currentRound).toBe(room.currentRound);
        expect(deserialized.drawnNumbers).toEqual(room.drawnNumbers);
        expect(deserialized.winners).toEqual(room.winners);

        expect(Object.keys(deserialized.players).length).toBe(
          Object.keys(room.players).length
        );
        for (const playerId in room.players) {
          expect(deserialized.players[playerId]).toEqual(
            room.players[playerId]
          );
        }

        expect(deserialized).toEqual(room);
      }),
      { numRuns: 100 }
    );
  });

  it('should have valid room structure with required fields', () => {
    const room = makeRoom();

    expect(room.id).toBeDefined();
    expect(room.name).toBeDefined();
    expect(room.adminId).toBeDefined();
    expect(room.createdAt).toBeDefined();
    expect(room.gameState).toBe('waiting');
    expect(room.currentRound).toBe(1);
    expect(room.players).toBeDefined();
    expect(room.drawnNumbers).toBeDefined();
    expect(room.winners).toBeDefined();
  });

  it('should preserve player data through serialization', () => {
    const room = makeRoom({
      gameState: 'in_progress',
      players: {
        'player-1': {
          name: 'Alice',
          cardNumbers: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45],
          markedNumbers: [1, 5, 10],
          joinedAt: Date.now(),
        },
        'player-2': {
          name: 'Bob',
          cardNumbers: [2, 6, 11, 16, 21, 26, 31, 36, 41, 46],
          markedNumbers: [],
          joinedAt: Date.now(),
        },
      },
      drawnNumbers: [1, 5, 10],
    });

    const serialized = JSON.stringify(room);
    const deserialized = JSON.parse(serialized) as Room;

    expect(deserialized.players['player-1'].name).toBe('Alice');
    expect(deserialized.players['player-1'].markedNumbers).toEqual([1, 5, 10]);
    expect(deserialized.players['player-2'].name).toBe('Bob');
    expect(deserialized.players['player-2'].markedNumbers).toEqual([]);
  });

  it('should preserve drawn numbers order', () => {
    const room = makeRoom({
      gameState: 'in_progress',
      drawnNumbers: [42, 17, 58, 5, 33],
    });

    const serialized = JSON.stringify(room);
    const deserialized = JSON.parse(serialized) as Room;

    expect(deserialized.drawnNumbers).toEqual([42, 17, 58, 5, 33]);
  });

  describe('Player Data Structure', () => {
    it('should support multiple players with unique IDs', () => {
      const room = makeRoom({
        players: {
          'player-1': {
            name: 'Alice',
            cardNumbers: Array.from({ length: 10 }, (_, i) => i + 1),
            markedNumbers: [],
            joinedAt: Date.now(),
          },
          'player-2': {
            name: 'Bob',
            cardNumbers: Array.from({ length: 10 }, (_, i) => i + 11),
            markedNumbers: [],
            joinedAt: Date.now() + 1000,
          },
        },
      });

      expect(Object.keys(room.players)).toHaveLength(2);
      expect(room.players['player-1'].name).toBe('Alice');
      expect(room.players['player-2'].name).toBe('Bob');
    });

    it('should track marked numbers per player', () => {
      const room = makeRoom({
        gameState: 'in_progress',
        players: {
          'player-1': {
            name: 'Alice',
            cardNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            markedNumbers: [1, 2, 3],
            joinedAt: Date.now(),
          },
        },
        drawnNumbers: [1, 2, 3, 50, 60],
      });

      expect(room.players['player-1'].markedNumbers).toHaveLength(3);
      expect(room.players['player-1'].markedNumbers).toEqual([1, 2, 3]);
    });

    it('should handle empty player list', () => {
      const room = makeRoom();
      expect(Object.keys(room.players)).toHaveLength(0);
    });
  });

  describe('Winner Tracking', () => {
    it('should store winners for completed rounds', () => {
      const timestamp = Date.now();
      const room = makeRoom({
        gameState: 'completed',
        winners: [
          { playerId: 'player-1', name: 'Winner', round: 1, timestamp },
        ],
      });

      expect(room.winners).toHaveLength(1);
      expect(room.winners[0].playerId).toBe('player-1');
      expect(room.winners[0].name).toBe('Winner');
      expect(room.winners[0].round).toBe(1);
      expect(room.winners[0].timestamp).toBe(timestamp);
    });

    it('should support multiple winners across rounds', () => {
      const room = makeRoom({
        currentRound: 2,
        winners: [
          { playerId: 'p1', name: 'Alice', round: 1, timestamp: 1 },
          { playerId: 'p2', name: 'Bob', round: 2, timestamp: 2 },
        ],
      });

      expect(room.winners).toHaveLength(2);
      expect(room.winners.map((w) => w.round)).toEqual([1, 2]);
    });

    it('should allow a room without winners', () => {
      const room = makeRoom();
      expect(room.winners).toHaveLength(0);
    });
  });

  describe('Drawn Numbers Validation', () => {
    it('should handle empty drawn numbers array', () => {
      const room = makeRoom();
      expect(room.drawnNumbers).toHaveLength(0);
    });

    it('should maintain drawn numbers in order', () => {
      const drawnSequence = [42, 17, 58, 5, 33, 11, 23];
      const room = makeRoom({
        gameState: 'in_progress',
        drawnNumbers: drawnSequence,
      });

      expect(room.drawnNumbers).toEqual(drawnSequence);
      expect(room.drawnNumbers[0]).toBe(42);
      expect(room.drawnNumbers[1]).toBe(17);
    });

    it('should support up to MAX_NUMBER drawn numbers', () => {
      const allNumbers = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);
      const room = makeRoom({
        gameState: 'in_progress',
        drawnNumbers: allNumbers,
      });

      expect(room.drawnNumbers).toHaveLength(MAX_NUMBER);
    });
  });

  describe('Game State Transitions', () => {
    it('should support waiting state for new rooms', () => {
      expect(makeRoom({ gameState: 'waiting' }).gameState).toBe('waiting');
    });

    it('should support in_progress state for active games', () => {
      const room = makeRoom({
        gameState: 'in_progress',
        drawnNumbers: [1, 2, 3],
      });
      expect(room.gameState).toBe('in_progress');
    });

    it('should support completed state for finished games', () => {
      const room = makeRoom({
        gameState: 'completed',
        drawnNumbers: [1, 2, 3],
      });
      expect(room.gameState).toBe('completed');
    });
  });
});
