"use client";

import { useMemo } from "react";
import {
  WinState as WinStateEnum,
  calculateWinState,
  getAnimationClasses,
} from "@/lib/animation-utils";

export interface WinState {
  state: WinStateEnum;
  percentage: number;
  numbersRemaining: number;
  cardClasses: string;
  shouldCelebrate: boolean;
}

export function useWinState(
  totalNumbers: number,
  markedNumbers: number,
): WinState {
  return useMemo(() => {
    const percentage =
      totalNumbers > 0 ? (markedNumbers / totalNumbers) * 100 : 0;

    const numbersRemaining = Math.max(0, totalNumbers - markedNumbers);

    const state = calculateWinState(totalNumbers, markedNumbers);

    const cardClasses = getAnimationClasses(state);

    const shouldCelebrate = markedNumbers === totalNumbers && totalNumbers > 0;

    return {
      state,
      percentage,
      numbersRemaining,
      cardClasses,
      shouldCelebrate,
    };
  }, [totalNumbers, markedNumbers]);
}
