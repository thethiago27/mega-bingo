"use client";

import { useEffect } from "react";

interface CelebrationOverlayProps {
  show: boolean;
  playerName: string;
  onComplete?: () => void;
}

export function CelebrationOverlay({
  show,
  playerName,
  onComplete,
}: CelebrationOverlayProps) {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show) return null;

  // Generate 15 confetti particles with random properties
  const confettiParticles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    color: ["#fbbf24", "#ef4444", "#a855f7", "#22c55e", "#3b82f6"][
      Math.floor(Math.random() * 5)
    ],
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-celebration-fade"
      aria-live="assertive"
      role="alert"
    >
      {/* Confetti particles */}
      {confettiParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 animate-confetti-fall"
          style={{
            left: `${particle.left}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      {/* BINGO message */}
      <div className="relative z-10 text-center px-8 py-12 bg-white/90 rounded-3xl shadow-2xl backdrop-blur-sm">
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-4 animate-pulse-critical">
          BINGO!
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-gray-800">
          Parabéns, {playerName}!
        </p>
      </div>
    </div>
  );
}
