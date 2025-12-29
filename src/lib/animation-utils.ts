export enum WinState {
  NORMAL = "normal",
  NEAR = "near",
  CRITICAL = "critical",
  WIN = "win",
}

export const WIN_STATE_THRESHOLDS = {
  NEAR: 75,
  CRITICAL: 90,
  WIN: 100,
} as const;

export const ANIMATION_CONFIGS = {
  nearWinPulse: {
    duration: 2000,
    timingFunction: "ease-in-out",
    iterations: "infinite" as const,
  },
  criticalWinPulse: {
    duration: 1000,
    timingFunction: "ease-in-out",
    iterations: "infinite" as const,
  },
  numberMark: {
    duration: 500,
    timingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    iterations: 1,
  },
  celebration: {
    duration: 3000,
    timingFunction: "ease-out",
    iterations: 1,
  },
} as const;

export function calculateWinState(
  totalNumbers: number,
  markedNumbers: number,
): WinState {
  if (totalNumbers <= 0 || markedNumbers < 0) {
    return WinState.NORMAL;
  }

  const clampedMarked = Math.min(markedNumbers, totalNumbers);

  const completionPercentage = (clampedMarked / totalNumbers) * 100;

  if (completionPercentage === WIN_STATE_THRESHOLDS.WIN) {
    return WinState.WIN;
  }
  if (completionPercentage >= WIN_STATE_THRESHOLDS.CRITICAL) {
    return WinState.CRITICAL;
  }
  if (completionPercentage >= WIN_STATE_THRESHOLDS.NEAR) {
    return WinState.NEAR;
  }
  return WinState.NORMAL;
}

export function getAnimationClasses(state: WinState): string {
  const classMap: Record<WinState, string> = {
    normal: "",
    near: "animate-pulse-near glow-near",
    critical: "animate-pulse-critical glow-critical",
    win: "animate-celebration glow-win",
  };

  return classMap[state];
}

export function getAdminIndicatorClasses(state: WinState): string {
  const classMap: Record<WinState, string> = {
    normal: "",
    near: "ring-2 ring-yellow-400/50",
    critical: "ring-2 ring-orange-500/70 animate-pulse",
    win: "ring-4 ring-green-500 bg-green-50",
  };

  return classMap[state];
}
