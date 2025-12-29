import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useWinState } from "./use-win-state";
import { WinState as WinStateEnum } from "@/lib/animation-utils";

describe("useWinState", () => {
  describe("Basic Functionality", () => {
    it("should return correct structure", () => {
      const { result } = renderHook(() => useWinState(20, 0));

      expect(result.current).toHaveProperty("state");
      expect(result.current).toHaveProperty("percentage");
      expect(result.current).toHaveProperty("numbersRemaining");
      expect(result.current).toHaveProperty("cardClasses");
      expect(result.current).toHaveProperty("shouldCelebrate");
    });

    it("should calculate percentage correctly", () => {
      const { result } = renderHook(() => useWinState(20, 10));

      expect(result.current.percentage).toBe(50);
    });

    it("should calculate numbers remaining correctly", () => {
      const { result } = renderHook(() => useWinState(20, 15));

      expect(result.current.numbersRemaining).toBe(5);
    });

    it("should handle zero total numbers", () => {
      const { result } = renderHook(() => useWinState(0, 0));

      expect(result.current.percentage).toBe(0);
      expect(result.current.numbersRemaining).toBe(0);
      expect(result.current.state).toBe(WinStateEnum.NORMAL);
    });
  });

  describe("Win State Calculation", () => {
    it("should return NORMAL state for 0% completion", () => {
      const { result } = renderHook(() => useWinState(20, 0));

      expect(result.current.state).toBe(WinStateEnum.NORMAL);
      expect(result.current.percentage).toBe(0);
    });

    it("should return NORMAL state for < 75% completion", () => {
      const { result } = renderHook(() => useWinState(20, 14));

      expect(result.current.state).toBe(WinStateEnum.NORMAL);
      expect(result.current.percentage).toBe(70);
    });

    it("should return NEAR state for 75% completion", () => {
      const { result } = renderHook(() => useWinState(20, 15));

      expect(result.current.state).toBe(WinStateEnum.NEAR);
      expect(result.current.percentage).toBe(75);
    });

    it("should return NEAR state for 80% completion", () => {
      const { result } = renderHook(() => useWinState(20, 16));

      expect(result.current.state).toBe(WinStateEnum.NEAR);
      expect(result.current.percentage).toBe(80);
    });

    it("should return NEAR state for 85% completion", () => {
      const { result } = renderHook(() => useWinState(20, 17));

      expect(result.current.state).toBe(WinStateEnum.NEAR);
      expect(result.current.percentage).toBe(85);
    });

    it("should return CRITICAL state for 90% completion", () => {
      const { result } = renderHook(() => useWinState(20, 18));

      expect(result.current.state).toBe(WinStateEnum.CRITICAL);
      expect(result.current.percentage).toBe(90);
    });

    it("should return CRITICAL state for 95% completion", () => {
      const { result } = renderHook(() => useWinState(20, 19));

      expect(result.current.state).toBe(WinStateEnum.CRITICAL);
      expect(result.current.percentage).toBe(95);
    });

    it("should return WIN state for 100% completion", () => {
      const { result } = renderHook(() => useWinState(20, 20));

      expect(result.current.state).toBe(WinStateEnum.WIN);
      expect(result.current.percentage).toBe(100);
    });
  });

  describe("Animation Classes", () => {
    it("should return empty classes for NORMAL state", () => {
      const { result } = renderHook(() => useWinState(20, 0));

      expect(result.current.cardClasses).toBe("");
    });

    it("should return animation classes for NEAR state", () => {
      const { result } = renderHook(() => useWinState(20, 15));

      expect(result.current.cardClasses).toContain("animate-pulse-near");
      expect(result.current.cardClasses).toContain("glow-near");
    });

    it("should return animation classes for CRITICAL state", () => {
      const { result } = renderHook(() => useWinState(20, 18));

      expect(result.current.cardClasses).toContain("animate-pulse-critical");
      expect(result.current.cardClasses).toContain("glow-critical");
    });

    it("should return celebration classes for WIN state", () => {
      const { result } = renderHook(() => useWinState(20, 20));

      expect(result.current.cardClasses).toContain("animate-celebration");
      expect(result.current.cardClasses).toContain("glow-win");
    });
  });

  describe("Celebration Trigger", () => {
    it("should not trigger celebration when no numbers marked", () => {
      const { result } = renderHook(() => useWinState(20, 0));

      expect(result.current.shouldCelebrate).toBe(false);
    });

    it("should not trigger celebration when partially complete", () => {
      const { result } = renderHook(() => useWinState(20, 10));

      expect(result.current.shouldCelebrate).toBe(false);
    });

    it("should not trigger celebration at 75%", () => {
      const { result } = renderHook(() => useWinState(20, 15));

      expect(result.current.shouldCelebrate).toBe(false);
    });

    it("should not trigger celebration at 90%", () => {
      const { result } = renderHook(() => useWinState(20, 18));

      expect(result.current.shouldCelebrate).toBe(false);
    });

    it("should not trigger celebration at 95%", () => {
      const { result } = renderHook(() => useWinState(20, 19));

      expect(result.current.shouldCelebrate).toBe(false);
    });

    it("should trigger celebration at exactly 100%", () => {
      const { result } = renderHook(() => useWinState(20, 20));

      expect(result.current.shouldCelebrate).toBe(true);
    });

    it("should not trigger celebration with zero total numbers", () => {
      const { result } = renderHook(() => useWinState(0, 0));

      expect(result.current.shouldCelebrate).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle negative marked numbers", () => {
      const { result } = renderHook(() => useWinState(20, -5));

      expect(result.current.percentage).toBe(-25);
      expect(result.current.numbersRemaining).toBe(25);
      expect(result.current.state).toBe(WinStateEnum.NORMAL);
      expect(result.current.shouldCelebrate).toBe(false);
    });

    it("should handle marked numbers exceeding total", () => {
      const { result } = renderHook(() => useWinState(20, 25));

      expect(result.current.percentage).toBe(125);
      expect(result.current.numbersRemaining).toBe(0);
      expect(result.current.state).toBe(WinStateEnum.WIN);
      expect(result.current.shouldCelebrate).toBe(false);
    });

    it("should handle negative total numbers", () => {
      const { result } = renderHook(() => useWinState(-20, 5));

      expect(result.current.percentage).toBe(0);
      expect(result.current.numbersRemaining).toBe(0);
      expect(result.current.state).toBe(WinStateEnum.NORMAL);
    });

    it("should handle very large numbers", () => {
      const { result } = renderHook(() => useWinState(1000, 750));

      expect(result.current.percentage).toBe(75);
      expect(result.current.numbersRemaining).toBe(250);
      expect(result.current.state).toBe(WinStateEnum.NEAR);
    });
  });

  describe("Boundary Conditions", () => {
    it("should transition from NORMAL to NEAR at exactly 75%", () => {
      const { result: result1 } = renderHook(() => useWinState(20, 14));
      const { result: result2 } = renderHook(() => useWinState(20, 15));

      expect(result1.current.state).toBe(WinStateEnum.NORMAL);
      expect(result2.current.state).toBe(WinStateEnum.NEAR);
    });

    it("should transition from NEAR to CRITICAL at exactly 90%", () => {
      const { result: result1 } = renderHook(() => useWinState(20, 17));
      const { result: result2 } = renderHook(() => useWinState(20, 18));

      expect(result1.current.state).toBe(WinStateEnum.NEAR);
      expect(result2.current.state).toBe(WinStateEnum.CRITICAL);
    });

    it("should transition from CRITICAL to WIN at exactly 100%", () => {
      const { result: result1 } = renderHook(() => useWinState(20, 19));
      const { result: result2 } = renderHook(() => useWinState(20, 20));

      expect(result1.current.state).toBe(WinStateEnum.CRITICAL);
      expect(result2.current.state).toBe(WinStateEnum.WIN);
    });
  });

  describe("Memoization", () => {
    it("should return same reference when inputs unchanged", () => {
      const { result, rerender } = renderHook(
        ({ total, marked }) => useWinState(total, marked),
        { initialProps: { total: 20, marked: 10 } },
      );

      const firstResult = result.current;
      rerender({ total: 20, marked: 10 });
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it("should return new reference when totalNumbers changes", () => {
      const { result, rerender } = renderHook(
        ({ total, marked }) => useWinState(total, marked),
        { initialProps: { total: 20, marked: 10 } },
      );

      const firstResult = result.current;
      rerender({ total: 25, marked: 10 });
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });

    it("should return new reference when markedNumbers changes", () => {
      const { result, rerender } = renderHook(
        ({ total, marked }) => useWinState(total, marked),
        { initialProps: { total: 20, marked: 10 } },
      );

      const firstResult = result.current;
      rerender({ total: 20, marked: 15 });
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });
  });

  describe("Different Total Numbers", () => {
    it("should work with 10 total numbers", () => {
      const { result } = renderHook(() => useWinState(10, 8));

      expect(result.current.percentage).toBe(80);
      expect(result.current.state).toBe(WinStateEnum.NEAR);
      expect(result.current.numbersRemaining).toBe(2);
    });

    it("should work with 100 total numbers", () => {
      const { result } = renderHook(() => useWinState(100, 90));

      expect(result.current.percentage).toBe(90);
      expect(result.current.state).toBe(WinStateEnum.CRITICAL);
      expect(result.current.numbersRemaining).toBe(10);
    });

    it("should work with 1 total number", () => {
      const { result } = renderHook(() => useWinState(1, 1));

      expect(result.current.percentage).toBe(100);
      expect(result.current.state).toBe(WinStateEnum.WIN);
      expect(result.current.shouldCelebrate).toBe(true);
    });
  });

  describe("State Progression", () => {
    it("should show monotonic state progression", () => {
      const states = [];
      for (let i = 0; i <= 20; i++) {
        const { result } = renderHook(() => useWinState(20, i));
        states.push(result.current.state);
      }

      const stateOrder: Record<WinStateEnum, number> = {
        [WinStateEnum.NORMAL]: 0,
        [WinStateEnum.NEAR]: 1,
        [WinStateEnum.CRITICAL]: 2,
        [WinStateEnum.WIN]: 3,
      };

      for (let i = 1; i < states.length; i++) {
        expect(stateOrder[states[i]]).toBeGreaterThanOrEqual(
          stateOrder[states[i - 1]],
        );
      }
    });
  });

  describe("Integration with Animation Utils", () => {
    it("should use calculateWinState from animation-utils", () => {
      const { result } = renderHook(() => useWinState(20, 15));

      // Verify it returns the same state as animation-utils
      expect(result.current.state).toBe(WinStateEnum.NEAR);
    });

    it("should use getAnimationClasses from animation-utils", () => {
      const { result } = renderHook(() => useWinState(20, 18));

      // Verify classes match animation-utils output
      expect(result.current.cardClasses).toContain("animate-pulse-critical");
    });
  });

  describe("Performance", () => {
    it("should handle rapid updates efficiently", () => {
      const { result, rerender } = renderHook(
        ({ marked }) => useWinState(20, marked),
        { initialProps: { marked: 0 } },
      );

      const start = performance.now();
      for (let i = 0; i <= 20; i++) {
        rerender({ marked: i });
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
      expect(result.current.state).toBe(WinStateEnum.WIN);
    });
  });
});
