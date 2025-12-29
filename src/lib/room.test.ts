import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { Room, GameState } from "@/lib/types";
// Generators for Room data
const gameStateArbitrary = () =>
  fc.constantFrom<GameState>("waiting", "in_progress", "completed");

const playerArbitrary = () =>
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

const roomArbitrary = () =>
  fc.record({
    id: fc.string({ minLength: 4, maxLength: 6 }),
    createdAt: fc.integer({ min: 0 }),
    gameState: gameStateArbitrary(),
    adminId: fc.string({ minLength: 1, maxLength: 50 }),
    players: fc.dictionary(fc.string({ minLength: 1 }), playerArbitrary(), {
      maxKeys: 10,
    }),
    drawnNumbers: fc.uniqueArray(fc.integer({ min: 1, max: 100 }), {
      minLength: 0,
      maxLength: 100,
    }),
  });

describe("Room Data Model", () => {
  describe("GameState Type", () => {
    it("should only allow valid game states", () => {
      // Requirements 2.5, 2.6, 2.7, 2.8
      const validStates: GameState[] = ["waiting", "in_progress", "completed"];

      validStates.forEach((state) => {
        const room: Room = {
          id: "TEST123",
          createdAt: Date.now(),
          gameState: state,
          adminId: "admin-1",
          players: {},
          drawnNumbers: [],
        };
        expect(room.gameState).toBe(state);
      });
    });
  });

  // Property 7: Room Persistence Round Trip
  // Feature: admin-dashboard, Property 7: Room Persistence Round Trip
  // Validates: Requirements 1.4
  it("Property 7: Room Persistence Round Trip - serialization preserves data", () => {
    fc.assert(
      fc.property(roomArbitrary(), (room: Room) => {
        // Simulate serialization (to JSON) and deserialization
        const serialized = JSON.stringify(room);
        const deserialized = JSON.parse(serialized) as Room;

        // Verify all fields are preserved
        expect(deserialized.id).toBe(room.id);
        expect(deserialized.createdAt).toBe(room.createdAt);
        expect(deserialized.gameState).toBe(room.gameState);
        expect(deserialized.adminId).toBe(room.adminId);
        expect(deserialized.drawnNumbers).toEqual(room.drawnNumbers);

        // Verify players are preserved
        expect(Object.keys(deserialized.players).length).toBe(
          Object.keys(room.players).length,
        );
        for (const playerId in room.players) {
          expect(deserialized.players[playerId]).toEqual(
            room.players[playerId],
          );
        }

        // Verify the deserialized room matches the original
        expect(deserialized).toEqual(room);
      }),
      { numRuns: 100 },
    );
  });

  // Unit tests for room structure
  it("should have valid room structure with required fields", () => {
    // Requirements 1.4
    const room: Room = {
      id: "ABC123",
      createdAt: Date.now(),
      gameState: "waiting",
      adminId: "admin-1",
      players: {},
      drawnNumbers: [],
    };

    expect(room.id).toBeDefined();
    expect(room.createdAt).toBeDefined();
    expect(room.gameState).toBe("waiting");
    expect(room.adminId).toBeDefined();
    expect(room.players).toBeDefined();
    expect(room.drawnNumbers).toBeDefined();
  });

  it("should support optional winner field", () => {
    // Requirements 6.1, 6.2
    const room: Room = {
      id: "ABC123",
      createdAt: Date.now(),
      gameState: "completed",
      adminId: "admin-1",
      players: {},
      drawnNumbers: [],
      winner: {
        playerId: "player-1",
        playerName: "John",
        winTime: Date.now(),
      },
      completedAt: Date.now(),
    };

    expect(room.winner).toBeDefined();
    expect(room.winner?.playerId).toBe("player-1");
    expect(room.winner?.playerName).toBe("John");
    expect(room.completedAt).toBeDefined();
  });

  it("should preserve player data through serialization", () => {
    // Requirements 1.4, 2.4
    const room: Room = {
      id: "ABC123",
      createdAt: Date.now(),
      gameState: "in_progress",
      adminId: "admin-1",
      players: {
        "player-1": {
          name: "Alice",
          cardNumbers: [
            1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80,
            85, 90, 95,
          ],
          markedNumbers: [1, 5, 10],
          joinedAt: Date.now(),
        },
        "player-2": {
          name: "Bob",
          cardNumbers: [
            2, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81,
            86, 91, 96,
          ],
          markedNumbers: [],
          joinedAt: Date.now(),
        },
      },
      drawnNumbers: [1, 5, 10],
    };

    const serialized = JSON.stringify(room);
    const deserialized = JSON.parse(serialized) as Room;

    expect(deserialized.players["player-1"].name).toBe("Alice");
    expect(deserialized.players["player-1"].markedNumbers).toEqual([1, 5, 10]);
    expect(deserialized.players["player-2"].name).toBe("Bob");
    expect(deserialized.players["player-2"].markedNumbers).toEqual([]);
  });

  it("should preserve drawn numbers order", () => {
    // Requirements 5.2
    const room: Room = {
      id: "ABC123",
      createdAt: Date.now(),
      gameState: "in_progress",
      adminId: "admin-1",
      players: {},
      drawnNumbers: [42, 17, 88, 5, 63],
    };

    const serialized = JSON.stringify(room);
    const deserialized = JSON.parse(serialized) as Room;

    expect(deserialized.drawnNumbers).toEqual([42, 17, 88, 5, 63]);
  });

  describe("Player Data Structure", () => {
    it("should support multiple players with unique IDs", () => {
      // Requirements 2.2, 2.3, 2.4
      const room: Room = {
        id: "ABC123",
        createdAt: Date.now(),
        gameState: "waiting",
        adminId: "admin-1",
        players: {
          "player-1": {
            name: "Alice",
            cardNumbers: Array.from({ length: 20 }, (_, i) => i + 1),
            markedNumbers: [],
            joinedAt: Date.now(),
          },
          "player-2": {
            name: "Bob",
            cardNumbers: Array.from({ length: 20 }, (_, i) => i + 21),
            markedNumbers: [],
            joinedAt: Date.now() + 1000,
          },
        },
        drawnNumbers: [],
      };

      expect(Object.keys(room.players)).toHaveLength(2);
      expect(room.players["player-1"].name).toBe("Alice");
      expect(room.players["player-2"].name).toBe("Bob");
    });

    it("should track marked numbers per player", () => {
      // Requirements 4.4, 4.5, 4.6
      const room: Room = {
        id: "ABC123",
        createdAt: Date.now(),
        gameState: "in_progress",
        adminId: "admin-1",
        players: {
          "player-1": {
            name: "Alice",
            cardNumbers: [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
              20,
            ],
            markedNumbers: [1, 2, 3],
            joinedAt: Date.now(),
          },
        },
        drawnNumbers: [1, 2, 3, 50, 60],
      };

      expect(room.players["player-1"].markedNumbers).toHaveLength(3);
      expect(room.players["player-1"].markedNumbers).toEqual([1, 2, 3]);
    });

    it("should handle empty player list", () => {
      // Requirements 2.2
      const room: Room = {
        id: "ABC123",
        createdAt: Date.now(),
        gameState: "waiting",
        adminId: "admin-1",
        players: {},
        drawnNumbers: [],
      };

      expect(Object.keys(room.players)).toHaveLength(0);
    });
  });

  describe("Winner Detection", () => {
    it("should store winner information when game is completed", () => {
      // Requirements 6.1, 6.2, 6.3
      const winTime = Date.now();
      const room: Room = {
        id: "ABC123",
        createdAt: Date.now() - 10000,
        gameState: "completed",
        adminId: "admin-1",
        players: {
          "player-1": {
            name: "Winner",
            cardNumbers: Array.from({ length: 20 }, (_, i) => i + 1),
            markedNumbers: Array.from({ length: 20 }, (_, i) => i + 1),
            joinedAt: Date.now() - 5000,
          },
        },
        drawnNumbers: Array.from({ length: 30 }, (_, i) => i + 1),
        winner: {
          playerId: "player-1",
          playerName: "Winner",
          winTime,
        },
        completedAt: winTime,
      };

      expect(room.winner).toBeDefined();
      expect(room.winner?.playerId).toBe("player-1");
      expect(room.winner?.playerName).toBe("Winner");
      expect(room.winner?.winTime).toBe(winTime);
      expect(room.completedAt).toBe(winTime);
    });

    it("should allow room without winner", () => {
      // Requirements 2.8
      const room: Room = {
        id: "ABC123",
        createdAt: Date.now(),
        gameState: "waiting",
        adminId: "admin-1",
        players: {},
        drawnNumbers: [],
      };

      expect(room.winner).toBeUndefined();
      expect(room.completedAt).toBeUndefined();
    });
  });

  describe("Drawn Numbers Validation", () => {
    it("should handle empty drawn numbers array", () => {
      // Requirements 3.1, 5.1
      const room: Room = {
        id: "ABC123",
        createdAt: Date.now(),
        gameState: "waiting",
        adminId: "admin-1",
        players: {},
        drawnNumbers: [],
      };

      expect(room.drawnNumbers).toHaveLength(0);
    });

    it("should maintain drawn numbers in order", () => {
      // Requirements 5.2, 5.3
      const drawnSequence = [42, 17, 88, 5, 63, 91, 23];
      const room: Room = {
        id: "ABC123",
        createdAt: Date.now(),
        gameState: "in_progress",
        adminId: "admin-1",
        players: {},
        drawnNumbers: drawnSequence,
      };

      expect(room.drawnNumbers).toEqual(drawnSequence);
      // Verify order is preserved (not sorted)
      expect(room.drawnNumbers[0]).toBe(42);
      expect(room.drawnNumbers[1]).toBe(17);
    });

    it("should support up to 100 drawn numbers", () => {
      // Requirements 3.6
      const allNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
      const room: Room = {
        id: "ABC123",
        createdAt: Date.now(),
        gameState: "in_progress",
        adminId: "admin-1",
        players: {},
        drawnNumbers: allNumbers,
      };

      expect(room.drawnNumbers).toHaveLength(100);
    });
  });

  describe("Game State Transitions", () => {
    it("should support waiting state for new rooms", () => {
      // Requirements 2.5
      const room: Room = {
        id: "ABC123",
        createdAt: Date.now(),
        gameState: "waiting",
        adminId: "admin-1",
        players: {},
        drawnNumbers: [],
      };

      expect(room.gameState).toBe("waiting");
    });

    it("should support in_progress state for active games", () => {
      // Requirements 2.6
      const room: Room = {
        id: "ABC123",
        createdAt: Date.now(),
        gameState: "in_progress",
        adminId: "admin-1",
        players: {},
        drawnNumbers: [1, 2, 3],
      };

      expect(room.gameState).toBe("in_progress");
    });

    it("should support completed state for finished games", () => {
      // Requirements 2.7, 2.8
      const room: Room = {
        id: "ABC123",
        createdAt: Date.now(),
        gameState: "completed",
        adminId: "admin-1",
        players: {},
        drawnNumbers: [1, 2, 3],
        completedAt: Date.now(),
      };

      expect(room.gameState).toBe("completed");
      expect(room.completedAt).toBeDefined();
    });
  });
});
