"use client";

import { useEffect, useRef } from "react";

interface AnimatedNumberProps {
  number: number;
  isMarked: boolean;
  isNew?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AnimatedNumber({
  number,
  isMarked,
  isNew = false,
  size = "md",
}: AnimatedNumberProps) {
  const prevMarkedRef = useRef(isMarked);
  const elementRef = useRef<HTMLDivElement>(null);

  // Detect marking transition and apply animation class directly
  useEffect(() => {
    if (!prevMarkedRef.current && isMarked && elementRef.current) {
      // Add animation class
      elementRef.current.classList.add("animate-number-mark");

      // Remove animation class after animation completes
      const timer = setTimeout(() => {
        elementRef.current?.classList.remove("animate-number-mark");
      }, 500); // Match animation duration

      return () => clearTimeout(timer);
    }
    prevMarkedRef.current = isMarked;
  }, [isMarked]);

  // Size variants
  const sizeClasses = {
    sm: "text-xl p-2",
    md: "text-3xl p-4",
    lg: "text-4xl p-6",
  };

  // Base classes
  const baseClasses =
    "flex items-center justify-center rounded-xl border-2 transition-all font-bold";

  // State-based classes
  const stateClasses = isMarked
    ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20"
    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white";

  // Apply isNew animation if provided
  const initialAnimationClass = isNew ? "animate-number-mark" : "";

  return (
    <div
      ref={elementRef}
      className={`${baseClasses} ${sizeClasses[size]} ${stateClasses} ${initialAnimationClass}`}
    >
      {number.toString().padStart(2, "0")}
    </div>
  );
}
