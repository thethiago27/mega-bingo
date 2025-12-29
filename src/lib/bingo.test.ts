import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { gerarCartela, verificarBingo } from "./bingo";

describe("Bingo Logic", () => {
  describe("gerarCartela", () => {
    // Property-based tests
    it("Property 1: Cartela Structure Validity", () => {
      // Feature: automated-testing, Property 1: Cartela structure validity
      // Validates: Requirements 2.1, 2.2, 2.3, 2.4
      fc.assert(
        fc.property(fc.constant(null), () => {
          const cartela = gerarCartela();

          // Requirement 2.1: Exactly 10 numbers
          expect(cartela).toHaveLength(10);

          // Requirement 2.2: All between 1-100 inclusive
          expect(cartela.every((n) => n >= 1 && n <= 100)).toBe(true);

          // Requirement 2.3: All unique (no duplicates)
          expect(new Set(cartela).size).toBe(10);

          // Requirement 2.4: Sorted in ascending order
          expect(cartela).toEqual([...cartela].sort((a, b) => a - b));
        }),
        { numRuns: 100 },
      );
    });

    it("Property 2: Cartela Randomness", () => {
      // Feature: automated-testing, Property 2: Cartela randomness
      // Validates: Requirements 2.5
      fc.assert(
        fc.property(fc.constant(null), () => {
          // Generate multiple cartelas
          const cartelas = Array.from({ length: 10 }, () => gerarCartela());

          // Convert each cartela to a string for comparison
          const cartelaStrings = cartelas.map((c) => c.join(","));

          // Not all cartelas should be identical
          const uniqueCartelas = new Set(cartelaStrings);
          expect(uniqueCartelas.size).toBeGreaterThan(1);
        }),
        { numRuns: 100 },
      );
    });

    // Unit tests
    it("should always generate exactly 10 numbers", () => {
      // Requirements 2.1
      const cartela = gerarCartela();
      expect(cartela).toHaveLength(10);
    });

    it("should generate numbers in valid range (1-100)", () => {
      // Requirements 2.2
      const cartela = gerarCartela();
      const min = Math.min(...cartela);
      const max = Math.max(...cartela);
      expect(min).toBeGreaterThanOrEqual(1);
      expect(max).toBeLessThanOrEqual(100);
    });

    it("should generate numbers in ascending order", () => {
      // Requirements 2.4
      const cartela = gerarCartela();
      const sorted = [...cartela].sort((a, b) => a - b);
      expect(cartela).toEqual(sorted);
    });
  });

  describe("verificarBingo", () => {
    // Property 3: Bingo Verification Correctness
    // Validates: Requirements 3.1, 3.2, 3.5
    it("should return true iff all cartela numbers are in numerosSorteados", () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 1, max: 100 }), {
            minLength: 10,
            maxLength: 10,
          }),
          fc.uniqueArray(fc.integer({ min: 1, max: 100 }), {
            minLength: 0,
            maxLength: 100,
          }),
          (cartela, sorteados) => {
            const result = verificarBingo(cartela, sorteados);
            const allNumbersPresent = cartela.every((num) =>
              sorteados.includes(num),
            );

            // Result should match whether all numbers are present
            expect(result).toBe(allNumbersPresent);
          },
        ),
        { numRuns: 100 },
      );
    });

    // Unit tests for specific cases
    it("should return true when all cartela numbers are in numerosSorteados", () => {
      // Requirement 3.1: Complete match
      const cartela = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
      const numerosSorteados = [
        1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60,
      ];

      expect(verificarBingo(cartela, numerosSorteados)).toBe(true);
    });

    it("should return false when not all cartela numbers are in numerosSorteados", () => {
      // Requirement 3.2: Partial match
      const cartela = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
      const numerosSorteados = [1, 5, 10, 15, 20]; // Missing half

      expect(verificarBingo(cartela, numerosSorteados)).toBe(false);
    });

    it("should return true for empty cartela", () => {
      // Requirement 3.3: Edge case - empty cartela
      const cartela: number[] = [];
      const numerosSorteados = [1, 2, 3, 4, 5];

      expect(verificarBingo(cartela, numerosSorteados)).toBe(true);
    });

    it("should return false when numerosSorteados is empty and cartela is not", () => {
      // Requirement 3.4: Edge case - empty numerosSorteados
      const cartela = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
      const numerosSorteados: number[] = [];

      expect(verificarBingo(cartela, numerosSorteados)).toBe(false);
    });

    it("should work correctly when numerosSorteados has extra numbers", () => {
      // Requirement 3.5: Extra numbers should not affect result
      const cartela = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
      const numerosSorteados = Array.from({ length: 100 }, (_, i) => i + 1); // All numbers 1-100

      expect(verificarBingo(cartela, numerosSorteados)).toBe(true);
    });
  });
});
