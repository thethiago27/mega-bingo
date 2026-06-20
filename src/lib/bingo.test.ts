import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CARD_SIZE, checkBingo, generateCard, MAX_NUMBER } from './bingo';

describe('Bingo Logic', () => {
  describe('generateCard', () => {
    // Property-based tests
    it('Property 1: Card Structure Validity', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const card = generateCard();

          // Exactly CARD_SIZE numbers
          expect(card).toHaveLength(CARD_SIZE);

          // All between 1 and MAX_NUMBER inclusive
          expect(card.every((n) => n >= 1 && n <= MAX_NUMBER)).toBe(true);

          // All unique (no duplicates)
          expect(new Set(card).size).toBe(CARD_SIZE);

          // Sorted in ascending order
          expect(card).toEqual([...card].sort((a, b) => a - b));
        }),
        { numRuns: 100 }
      );
    });

    it('Property 2: Card Randomness', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          // Generate multiple cards
          const cards = Array.from({ length: 10 }, () => generateCard());

          // Convert each card to a string for comparison
          const cardStrings = cards.map((c) => c.join(','));

          // Not all cards should be identical
          const uniqueCards = new Set(cardStrings);
          expect(uniqueCards.size).toBeGreaterThan(1);
        }),
        { numRuns: 100 }
      );
    });

    // Unit tests
    it('should always generate exactly CARD_SIZE numbers', () => {
      const card = generateCard();
      expect(card).toHaveLength(CARD_SIZE);
    });

    it('should generate numbers in valid range (1-MAX_NUMBER)', () => {
      const card = generateCard();
      const min = Math.min(...card);
      const max = Math.max(...card);
      expect(min).toBeGreaterThanOrEqual(1);
      expect(max).toBeLessThanOrEqual(MAX_NUMBER);
    });

    it('should generate numbers in ascending order', () => {
      const card = generateCard();
      const sorted = [...card].sort((a, b) => a - b);
      expect(card).toEqual(sorted);
    });
  });

  describe('checkBingo', () => {
    // Property: returns true iff all card numbers are in drawnNumbers
    it('should return true iff all card numbers are in drawnNumbers', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 1, max: MAX_NUMBER }), {
            minLength: CARD_SIZE,
            maxLength: CARD_SIZE,
          }),
          fc.uniqueArray(fc.integer({ min: 1, max: MAX_NUMBER }), {
            minLength: 0,
            maxLength: MAX_NUMBER,
          }),
          (card, drawn) => {
            const result = checkBingo(card, drawn);
            const allNumbersPresent = card.every((num) => drawn.includes(num));

            expect(result).toBe(allNumbersPresent);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Unit tests for specific cases
    it('should return true when all card numbers are in drawnNumbers', () => {
      const card = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
      const drawnNumbers = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

      expect(checkBingo(card, drawnNumbers)).toBe(true);
    });

    it('should return false when not all card numbers are in drawnNumbers', () => {
      const card = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
      const drawnNumbers = [1, 5, 10, 15, 20]; // Missing half

      expect(checkBingo(card, drawnNumbers)).toBe(false);
    });

    it('should return true for empty card', () => {
      const card: number[] = [];
      const drawnNumbers = [1, 2, 3, 4, 5];

      expect(checkBingo(card, drawnNumbers)).toBe(true);
    });

    it('should return false when drawnNumbers is empty and card is not', () => {
      const card = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
      const drawnNumbers: number[] = [];

      expect(checkBingo(card, drawnNumbers)).toBe(false);
    });

    it('should work correctly when drawnNumbers has extra numbers', () => {
      const card = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
      const drawnNumbers = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);

      expect(checkBingo(card, drawnNumbers)).toBe(true);
    });
  });
});
