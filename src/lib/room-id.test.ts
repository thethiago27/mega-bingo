import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { generateRoomId } from "./room-id";

describe("Room ID Generation", () => {
  // Property 1: Room ID Uniqueness
  // Feature: admin-dashboard, Property 1: Room ID Uniqueness
  // Validates: Requirements 1.2
  it("Property 1: Room ID Uniqueness - generates unique IDs", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        // Generate multiple room IDs
        const ids = Array.from({ length: 100 }, () => generateRoomId());

        // All IDs should be unique
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(100);
      }),
      { numRuns: 10 },
    );
  });

  // Unit tests for room ID generation
  it("should generate IDs with 4-6 characters", () => {
    // Requirements 1.2
    for (let i = 0; i < 50; i++) {
      const id = generateRoomId();
      expect(id.length).toBeGreaterThanOrEqual(4);
      expect(id.length).toBeLessThanOrEqual(6);
    }
  });

  it("should only use alphanumeric characters", () => {
    // Requirements 1.2
    const alphanumericRegex = /^[A-Z0-9]+$/;
    for (let i = 0; i < 50; i++) {
      const id = generateRoomId();
      expect(alphanumericRegex.test(id)).toBe(true);
    }
  });

  it("should generate non-empty IDs", () => {
    // Requirements 1.2
    for (let i = 0; i < 50; i++) {
      const id = generateRoomId();
      expect(id.length).toBeGreaterThan(0);
    }
  });
});
