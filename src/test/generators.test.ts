import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CARD_SIZE, MAX_NUMBER } from '@/lib/bingo';
import { bingoNumber, bingoNumbers, card, drawnNumbers } from './generators';

describe('Test Generators', () => {
  describe('bingoNumber', () => {
    it('should generate numbers between 1 and MAX_NUMBER', () => {
      fc.assert(
        fc.property(bingoNumber(), (num) => {
          expect(num).toBeGreaterThanOrEqual(1);
          expect(num).toBeLessThanOrEqual(MAX_NUMBER);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate integers only', () => {
      fc.assert(
        fc.property(bingoNumber(), (num) => {
          expect(Number.isInteger(num)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('bingoNumbers', () => {
    it('should generate exactly the requested count of numbers', () => {
      const counts = [1, 5, 10, 20, 50];

      counts.forEach((count) => {
        fc.assert(
          fc.property(bingoNumbers(count), (nums) => {
            expect(nums).toHaveLength(count);
          }),
          { numRuns: 50 }
        );
      });
    });

    it('should generate unique numbers only', () => {
      fc.assert(
        fc.property(bingoNumbers(10), (nums) => {
          const uniqueNums = new Set(nums);
          expect(uniqueNums.size).toBe(nums.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate numbers in valid bingo range', () => {
      fc.assert(
        fc.property(bingoNumbers(10), (nums) => {
          nums.forEach((num) => {
            expect(num).toBeGreaterThanOrEqual(1);
            expect(num).toBeLessThanOrEqual(MAX_NUMBER);
          });
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('card', () => {
    it('should generate exactly CARD_SIZE numbers', () => {
      fc.assert(
        fc.property(card(), (c) => {
          expect(c).toHaveLength(CARD_SIZE);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate unique numbers', () => {
      fc.assert(
        fc.property(card(), (c) => {
          const uniqueNums = new Set(c);
          expect(uniqueNums.size).toBe(CARD_SIZE);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate numbers in ascending order', () => {
      fc.assert(
        fc.property(card(), (c) => {
          const sorted = [...c].sort((a, b) => a - b);
          expect(c).toEqual(sorted);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate numbers between 1 and MAX_NUMBER', () => {
      fc.assert(
        fc.property(card(), (c) => {
          expect(Math.min(...c)).toBeGreaterThanOrEqual(1);
          expect(Math.max(...c)).toBeLessThanOrEqual(MAX_NUMBER);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate different cards (randomness check)', () => {
      const cards = fc.sample(card(), 10);
      const uniqueCards = new Set(cards.map((c) => JSON.stringify(c)));

      // At least some variation in 10 samples
      expect(uniqueCards.size).toBeGreaterThan(1);
    });
  });

  describe('drawnNumbers', () => {
    it('should generate arrays with length between 0 and MAX_NUMBER', () => {
      fc.assert(
        fc.property(drawnNumbers(), (nums) => {
          expect(nums.length).toBeGreaterThanOrEqual(0);
          expect(nums.length).toBeLessThanOrEqual(MAX_NUMBER);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate unique numbers only', () => {
      fc.assert(
        fc.property(drawnNumbers(), (nums) => {
          const uniqueNums = new Set(nums);
          expect(uniqueNums.size).toBe(nums.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate numbers in valid bingo range', () => {
      fc.assert(
        fc.property(drawnNumbers(), (nums) => {
          nums.forEach((num) => {
            expect(num).toBeGreaterThanOrEqual(1);
            expect(num).toBeLessThanOrEqual(MAX_NUMBER);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should handle empty arrays', () => {
      const samples = fc.sample(drawnNumbers(), 100);
      const hasEmpty = samples.some((nums) => nums.length === 0);

      // Should occasionally generate empty arrays
      expect(hasEmpty).toBe(true);
    });

    it('should generate varying lengths', () => {
      const samples = fc.sample(drawnNumbers(), 100);
      const lengths = new Set(samples.map((nums) => nums.length));

      // Should have variety in lengths
      expect(lengths.size).toBeGreaterThan(5);
    });
  });
});
