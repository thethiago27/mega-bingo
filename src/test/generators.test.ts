import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  bingoNumber,
  bingoNumbers,
  cartela,
  numerosSorteados,
} from "./generators";

describe("Test Generators", () => {
  describe("bingoNumber", () => {
    it("should generate numbers between 1 and 100", () => {
      fc.assert(
        fc.property(bingoNumber(), (num) => {
          expect(num).toBeGreaterThanOrEqual(1);
          expect(num).toBeLessThanOrEqual(100);
        }),
        { numRuns: 100 },
      );
    });

    it("should generate integers only", () => {
      fc.assert(
        fc.property(bingoNumber(), (num) => {
          expect(Number.isInteger(num)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("bingoNumbers", () => {
    it("should generate exactly the requested count of numbers", () => {
      const counts = [1, 5, 10, 20, 50];

      counts.forEach((count) => {
        fc.assert(
          fc.property(bingoNumbers(count), (nums) => {
            expect(nums).toHaveLength(count);
          }),
          { numRuns: 50 },
        );
      });
    });

    it("should generate unique numbers only", () => {
      fc.assert(
        fc.property(bingoNumbers(20), (nums) => {
          const uniqueNums = new Set(nums);
          expect(uniqueNums.size).toBe(nums.length);
        }),
        { numRuns: 100 },
      );
    });

    it("should generate numbers in valid bingo range", () => {
      fc.assert(
        fc.property(bingoNumbers(20), (nums) => {
          nums.forEach((num) => {
            expect(num).toBeGreaterThanOrEqual(1);
            expect(num).toBeLessThanOrEqual(100);
          });
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("cartela", () => {
    it("should generate exactly 20 numbers", () => {
      fc.assert(
        fc.property(cartela(), (card) => {
          expect(card).toHaveLength(20);
        }),
        { numRuns: 100 },
      );
    });

    it("should generate unique numbers", () => {
      fc.assert(
        fc.property(cartela(), (card) => {
          const uniqueNums = new Set(card);
          expect(uniqueNums.size).toBe(20);
        }),
        { numRuns: 100 },
      );
    });

    it("should generate numbers in ascending order", () => {
      fc.assert(
        fc.property(cartela(), (card) => {
          const sorted = [...card].sort((a, b) => a - b);
          expect(card).toEqual(sorted);
        }),
        { numRuns: 100 },
      );
    });

    it("should generate numbers between 1 and 100", () => {
      fc.assert(
        fc.property(cartela(), (card) => {
          expect(Math.min(...card)).toBeGreaterThanOrEqual(1);
          expect(Math.max(...card)).toBeLessThanOrEqual(100);
        }),
        { numRuns: 100 },
      );
    });

    it("should generate different cartelas (randomness check)", () => {
      const cartelas = fc.sample(cartela(), 10);
      const uniqueCartelas = new Set(cartelas.map((c) => JSON.stringify(c)));

      // At least some variation in 10 samples
      expect(uniqueCartelas.size).toBeGreaterThan(1);
    });
  });

  describe("numerosSorteados", () => {
    it("should generate arrays with length between 0 and 100", () => {
      fc.assert(
        fc.property(numerosSorteados(), (nums) => {
          expect(nums.length).toBeGreaterThanOrEqual(0);
          expect(nums.length).toBeLessThanOrEqual(100);
        }),
        { numRuns: 100 },
      );
    });

    it("should generate unique numbers only", () => {
      fc.assert(
        fc.property(numerosSorteados(), (nums) => {
          const uniqueNums = new Set(nums);
          expect(uniqueNums.size).toBe(nums.length);
        }),
        { numRuns: 100 },
      );
    });

    it("should generate numbers in valid bingo range", () => {
      fc.assert(
        fc.property(numerosSorteados(), (nums) => {
          nums.forEach((num) => {
            expect(num).toBeGreaterThanOrEqual(1);
            expect(num).toBeLessThanOrEqual(100);
          });
        }),
        { numRuns: 100 },
      );
    });

    it("should handle empty arrays", () => {
      const samples = fc.sample(numerosSorteados(), 100);
      const hasEmpty = samples.some((nums) => nums.length === 0);

      // Should occasionally generate empty arrays
      expect(hasEmpty).toBe(true);
    });

    it("should generate varying lengths", () => {
      const samples = fc.sample(numerosSorteados(), 100);
      const lengths = new Set(samples.map((nums) => nums.length));

      // Should have variety in lengths
      expect(lengths.size).toBeGreaterThan(5);
    });
  });
});
