import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Mock Firebase modules
vi.mock('@/lib/firebase-utils', () => ({
  getDb: vi.fn(() => ({})),
}));

const mockGet = vi.fn();
const mockUpdate = vi.fn();
const mockRef = vi.fn(() => 'mockRef');

vi.mock('firebase/database', () => ({
  ref: (...args: Parameters<typeof mockRef>) => mockRef(...args),
  get: (...args: Parameters<typeof mockGet>) => mockGet(...args),
  update: (...args: Parameters<typeof mockUpdate>) => mockUpdate(...args),
  push: vi.fn(() => ({ key: 'mock-key' })),
  set: vi.fn(),
  onValue: vi.fn(),
}));

vi.mock('@/lib/bingo', () => ({
  gerarCartela: vi.fn(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
}));

import { drawNumber } from './database';

describe('database.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('drawNumber', () => {
    it('should return null when room does not exist', async () => {
      mockGet.mockResolvedValue({ exists: () => false });

      const result = await drawNumber('non-existent-room');

      expect(result).toBeNull();
    });

    it('should return null when all 60 numbers have been drawn', async () => {
      const allNumbers = Array.from({ length: 60 }, (_, i) => i + 1);
      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({ numerosSorteados: allNumbers }),
      });

      const result = await drawNumber('test-room');

      expect(result).toBeNull();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should draw a number between 1 and 60', async () => {
      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({ numerosSorteados: [] }),
      });
      mockUpdate.mockResolvedValue(undefined);

      const result = await drawNumber('test-room');

      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(60);
    });

    it('should not draw a number that was already drawn', async () => {
      const alreadyDrawn = [1, 2, 3, 4, 5];
      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({ numerosSorteados: alreadyDrawn }),
      });
      mockUpdate.mockResolvedValue(undefined);

      const result = await drawNumber('test-room');

      expect(result).not.toBeNull();
      expect(alreadyDrawn).not.toContain(result);
    });

    it('should update the room with the new drawn number', async () => {
      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({ numerosSorteados: [10, 20, 30] }),
      });
      mockUpdate.mockResolvedValue(undefined);

      const result = await drawNumber('test-room');

      expect(mockUpdate).toHaveBeenCalledWith('mockRef', {
        numerosSorteados: expect.arrayContaining([10, 20, 30, result]),
      });
    });

    it('should handle empty numerosSorteados array', async () => {
      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({ numerosSorteados: undefined }),
      });
      mockUpdate.mockResolvedValue(undefined);

      const result = await drawNumber('test-room');

      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(60);
    });

    // Property-based test for number range
    it('Property: drawn numbers should always be in valid range (1-60)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.uniqueArray(fc.integer({ min: 1, max: 60 }), {
            minLength: 0,
            maxLength: 59,
          }),
          async (existingNumbers) => {
            mockGet.mockResolvedValue({
              exists: () => true,
              val: () => ({ numerosSorteados: existingNumbers }),
            });
            mockUpdate.mockResolvedValue(undefined);

            const result = await drawNumber('test-room');

            if (result !== null) {
              expect(result).toBeGreaterThanOrEqual(1);
              expect(result).toBeLessThanOrEqual(60);
              expect(existingNumbers).not.toContain(result);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    // Property-based test for uniqueness
    it('Property: drawn number should never be in existing numbers', () => {
      fc.assert(
        fc.asyncProperty(
          fc.uniqueArray(fc.integer({ min: 1, max: 60 }), {
            minLength: 1,
            maxLength: 55,
          }),
          async (existingNumbers) => {
            mockGet.mockResolvedValue({
              exists: () => true,
              val: () => ({ numerosSorteados: existingNumbers }),
            });
            mockUpdate.mockResolvedValue(undefined);

            const result = await drawNumber('test-room');

            expect(result).not.toBeNull();
            expect(existingNumbers).not.toContain(result);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return null when exactly 60 numbers are drawn', async () => {
      const exactly60Numbers = Array.from({ length: 60 }, (_, i) => i + 1);
      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({ numerosSorteados: exactly60Numbers }),
      });

      const result = await drawNumber('test-room');

      expect(result).toBeNull();
    });

    it('should still draw when 59 numbers are drawn', async () => {
      const numbers59 = Array.from({ length: 59 }, (_, i) => i + 1);
      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({ numerosSorteados: numbers59 }),
      });
      mockUpdate.mockResolvedValue(undefined);

      const result = await drawNumber('test-room');

      expect(result).toBe(60); // Only number left
    });
  });
});
