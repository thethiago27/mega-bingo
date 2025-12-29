import { describe, it, expect } from "vitest";
import {
  calculateWinState,
  getAnimationClasses,
  getAdminIndicatorClasses,
  WIN_STATE_THRESHOLDS,
  ANIMATION_CONFIGS,
  WinState,
} from "./animation-utils";

describe("animation-utils", () => {
  describe("WIN_STATE_THRESHOLDS", () => {
    it("should have correct threshold values", () => {
      expect(WIN_STATE_THRESHOLDS.NEAR).toBe(75);
      expect(WIN_STATE_THRESHOLDS.CRITICAL).toBe(90);
      expect(WIN_STATE_THRESHOLDS.WIN).toBe(100);
    });
  });

  describe("ANIMATION_CONFIGS", () => {
    it("should have correct nearWinPulse config", () => {
      expect(ANIMATION_CONFIGS.nearWinPulse.duration).toBe(2000);
      expect(ANIMATION_CONFIGS.nearWinPulse.timingFunction).toBe("ease-in-out");
      expect(ANIMATION_CONFIGS.nearWinPulse.iterations).toBe("infinite");
    });

    it("should have correct criticalWinPulse config", () => {
      expect(ANIMATION_CONFIGS.criticalWinPulse.duration).toBe(1000);
      expect(ANIMATION_CONFIGS.criticalWinPulse.timingFunction).toBe(
        "ease-in-out",
      );
      expect(ANIMATION_CONFIGS.criticalWinPulse.iterations).toBe("infinite");
    });

    it("should have correct numberMark config", () => {
      expect(ANIMATION_CONFIGS.numberMark.duration).toBe(500);
      expect(ANIMATION_CONFIGS.numberMark.timingFunction).toBe(
        "cubic-bezier(0.34, 1.56, 0.64, 1)",
      );
      expect(ANIMATION_CONFIGS.numberMark.iterations).toBe(1);
    });

    it("should have correct celebration config", () => {
      expect(ANIMATION_CONFIGS.celebration.duration).toBe(3000);
      expect(ANIMATION_CONFIGS.celebration.timingFunction).toBe("ease-out");
      expect(ANIMATION_CONFIGS.celebration.iterations).toBe(1);
    });
  });

  describe("calculateWinState", () => {
    describe("Normal State (< 75%)", () => {
      it("should return normal for 0 marked numbers", () => {
        expect(calculateWinState(20, 0)).toBe(WinState.NORMAL);
      });

      it("should return normal for 1 marked number (5%)", () => {
        expect(calculateWinState(20, 1)).toBe(WinState.NORMAL);
      });

      it("should return normal for 10 marked numbers (50%)", () => {
        expect(calculateWinState(20, 10)).toBe(WinState.NORMAL);
      });

      it("should return normal for 14 marked numbers (70%)", () => {
        expect(calculateWinState(20, 14)).toBe(WinState.NORMAL);
      });
    });

    describe("Near Win State (75-89%)", () => {
      it("should return near for 15 marked numbers (75%)", () => {
        expect(calculateWinState(20, 15)).toBe(WinState.NEAR);
      });

      it("should return near for 16 marked numbers (80%)", () => {
        expect(calculateWinState(20, 16)).toBe(WinState.NEAR);
      });

      it("should return near for 17 marked numbers (85%)", () => {
        expect(calculateWinState(20, 17)).toBe(WinState.NEAR);
      });
    });

    describe("Critical Win State (90-99%)", () => {
      it("should return critical for 18 marked numbers (90%)", () => {
        expect(calculateWinState(20, 18)).toBe(WinState.CRITICAL);
      });

      it("should return critical for 19 marked numbers (95%)", () => {
        expect(calculateWinState(20, 19)).toBe(WinState.CRITICAL);
      });
    });

    describe("Win State (100%)", () => {
      it("should return win for 20 marked numbers (100%)", () => {
        expect(calculateWinState(20, 20)).toBe(WinState.WIN);
      });
    });

    describe("Edge Cases", () => {
      it("should return normal for negative total numbers", () => {
        expect(calculateWinState(-1, 5)).toBe(WinState.NORMAL);
      });

      it("should return normal for zero total numbers", () => {
        expect(calculateWinState(0, 5)).toBe(WinState.NORMAL);
      });

      it("should return normal for negative marked numbers", () => {
        expect(calculateWinState(20, -1)).toBe(WinState.NORMAL);
      });

      it("should clamp marked numbers to total numbers", () => {
        expect(calculateWinState(20, 25)).toBe(WinState.WIN);
      });

      it("should handle marked numbers exceeding total", () => {
        expect(calculateWinState(20, 100)).toBe(WinState.WIN);
      });
    });

    describe("Boundary Conditions", () => {
      it("should transition from normal to near at exactly 75%", () => {
        expect(calculateWinState(20, 14)).toBe(WinState.NORMAL);
        expect(calculateWinState(20, 15)).toBe(WinState.NEAR);
      });

      it("should transition from near to critical at exactly 90%", () => {
        expect(calculateWinState(20, 17)).toBe(WinState.NEAR);
        expect(calculateWinState(20, 18)).toBe(WinState.CRITICAL);
      });

      it("should transition from critical to win at exactly 100%", () => {
        expect(calculateWinState(20, 19)).toBe(WinState.CRITICAL);
        expect(calculateWinState(20, 20)).toBe(WinState.WIN);
      });
    });

    describe("Different Total Numbers", () => {
      it("should work with 10 total numbers", () => {
        expect(calculateWinState(10, 0)).toBe(WinState.NORMAL);
        expect(calculateWinState(10, 7)).toBe(WinState.NORMAL);
        expect(calculateWinState(10, 8)).toBe(WinState.NEAR);
        expect(calculateWinState(10, 9)).toBe(WinState.CRITICAL);
        expect(calculateWinState(10, 10)).toBe(WinState.WIN);
      });

      it("should work with 100 total numbers", () => {
        expect(calculateWinState(100, 74)).toBe(WinState.NORMAL);
        expect(calculateWinState(100, 75)).toBe(WinState.NEAR);
        expect(calculateWinState(100, 90)).toBe(WinState.CRITICAL);
        expect(calculateWinState(100, 100)).toBe(WinState.WIN);
      });

      it("should work with 1 total number", () => {
        expect(calculateWinState(1, 0)).toBe(WinState.NORMAL);
        expect(calculateWinState(1, 1)).toBe(WinState.WIN);
      });
    });
  });

  describe("getAnimationClasses", () => {
    it("should return empty string for normal state", () => {
      expect(getAnimationClasses(WinState.NORMAL)).toBe("");
    });

    it("should return correct classes for near state", () => {
      const classes = getAnimationClasses(WinState.NEAR);
      expect(classes).toContain("animate-pulse-near");
      expect(classes).toContain("glow-near");
    });

    it("should return correct classes for critical state", () => {
      const classes = getAnimationClasses(WinState.CRITICAL);
      expect(classes).toContain("animate-pulse-critical");
      expect(classes).toContain("glow-critical");
    });

    it("should return correct classes for win state", () => {
      const classes = getAnimationClasses(WinState.WIN);
      expect(classes).toContain("animate-celebration");
      expect(classes).toContain("glow-win");
    });

    it("should return consistent results for same state", () => {
      const result1 = getAnimationClasses(WinState.NEAR);
      const result2 = getAnimationClasses(WinState.NEAR);
      expect(result1).toBe(result2);
    });

    it("should handle all valid WinState values", () => {
      const states: WinState[] = [
        WinState.NORMAL,
        WinState.NEAR,
        WinState.CRITICAL,
        WinState.WIN,
      ];
      states.forEach((state) => {
        expect(() => getAnimationClasses(state)).not.toThrow();
        expect(typeof getAnimationClasses(state)).toBe("string");
      });
    });
  });

  describe("getAdminIndicatorClasses", () => {
    it("should return empty string for normal state", () => {
      expect(getAdminIndicatorClasses(WinState.NORMAL)).toBe("");
    });

    it("should return correct classes for near state", () => {
      const classes = getAdminIndicatorClasses(WinState.NEAR);
      expect(classes).toContain("ring-2");
      expect(classes).toContain("ring-yellow-400/50");
    });

    it("should return correct classes for critical state", () => {
      const classes = getAdminIndicatorClasses(WinState.CRITICAL);
      expect(classes).toContain("ring-2");
      expect(classes).toContain("ring-orange-500/70");
      expect(classes).toContain("animate-pulse");
    });

    it("should return correct classes for win state", () => {
      const classes = getAdminIndicatorClasses(WinState.WIN);
      expect(classes).toContain("ring-4");
      expect(classes).toContain("ring-green-500");
      expect(classes).toContain("bg-green-50");
    });

    it("should return consistent results for same state", () => {
      const result1 = getAdminIndicatorClasses(WinState.CRITICAL);
      const result2 = getAdminIndicatorClasses(WinState.CRITICAL);
      expect(result1).toBe(result2);
    });

    it("should handle all valid WinState values", () => {
      const states: WinState[] = [
        WinState.NORMAL,
        WinState.NEAR,
        WinState.CRITICAL,
        WinState.WIN,
      ];
      states.forEach((state) => {
        expect(() => getAdminIndicatorClasses(state)).not.toThrow();
        expect(typeof getAdminIndicatorClasses(state)).toBe("string");
      });
    });

    it("should use different styling than player classes", () => {
      const playerClasses = getAnimationClasses(WinState.NEAR);
      const adminClasses = getAdminIndicatorClasses(WinState.NEAR);
      expect(playerClasses).not.toBe(adminClasses);
    });
  });

  describe("Integration: State Progression", () => {
    it("should show monotonic state progression as numbers increase", () => {
      const states: WinState[] = [];
      for (let i = 0; i <= 20; i++) {
        states.push(calculateWinState(20, i));
      }

      // Verify no backwards transitions
      const stateOrder: Record<WinState, number> = {
        [WinState.NORMAL]: 0,
        [WinState.NEAR]: 1,
        [WinState.CRITICAL]: 2,
        [WinState.WIN]: 3,
      };

      for (let i = 1; i < states.length; i++) {
        expect(stateOrder[states[i]]).toBeGreaterThanOrEqual(
          stateOrder[states[i - 1]],
        );
      }
    });

    it("should have consistent player and admin state calculations", () => {
      for (let marked = 0; marked <= 20; marked++) {
        const state = calculateWinState(20, marked);
        const playerClasses = getAnimationClasses(state);
        const adminClasses = getAdminIndicatorClasses(state);

        // Both should return strings
        expect(typeof playerClasses).toBe("string");
        expect(typeof adminClasses).toBe("string");

        // Both should be empty for normal state
        if (state === WinState.NORMAL) {
          expect(playerClasses).toBe("");
          expect(adminClasses).toBe("");
        } else {
          // Both should have content for other states
          expect(playerClasses.length).toBeGreaterThan(0);
          expect(adminClasses.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Performance", () => {
    it("should calculate state quickly for many iterations", () => {
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        calculateWinState(20, i % 21);
      }
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete in < 100ms
    });

    it("should generate classes quickly for many iterations", () => {
      const states: WinState[] = [
        WinState.NORMAL,
        WinState.NEAR,
        WinState.CRITICAL,
        WinState.WIN,
      ];
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        getAnimationClasses(states[i % 4]);
        getAdminIndicatorClasses(states[i % 4]);
      }
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete in < 100ms
    });
  });
});
