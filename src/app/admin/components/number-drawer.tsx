"use client";

import { GameState } from "@/lib/types";
import { useState } from "react";

interface NumberDrawerProps {
  gameState: GameState;
  drawnNumbers: number[];
  onDrawNumber: () => Promise<number | null>;
}

export function NumberDrawer({
  gameState,
  drawnNumbers,
  onDrawNumber,
}: NumberDrawerProps) {
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDrawn, setLastDrawn] = useState<number | null>(null);

  const totalPossible = 100;
  const remaining = totalPossible - drawnNumbers.length;
  const canDraw = gameState === "in_progress" && remaining > 0;

  const handleDrawNumber = async () => {
    setDrawing(true);
    setError(null);
    try {
      const number = await onDrawNumber();
      if (number) {
        setLastDrawn(number);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao sortear número");
    } finally {
      setDrawing(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Sortear Número</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {lastDrawn && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-center">
          <p className="text-white text-sm font-medium mb-2">Último Número</p>
          <p className="text-white text-6xl font-bold">{lastDrawn}</p>
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Números sorteados</p>
          <p className="text-2xl font-bold text-gray-900">
            {drawnNumbers.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Restantes</p>
          <p className="text-2xl font-bold text-gray-900">{remaining}</p>
        </div>
      </div>

      <button
        onClick={handleDrawNumber}
        disabled={!canDraw || drawing}
        className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {drawing
          ? "Sorteando..."
          : canDraw
            ? "Sortear Número"
            : "Não Disponível"}
      </button>

      {gameState !== "in_progress" && (
        <p className="mt-3 text-sm text-gray-600 text-center">
          {gameState === "waiting"
            ? "Inicie o jogo para começar a sortear"
            : "O jogo foi encerrado"}
        </p>
      )}

      {remaining === 0 && gameState === "in_progress" && (
        <p className="mt-3 text-sm text-gray-600 text-center">
          Todos os números foram sorteados!
        </p>
      )}
    </div>
  );
}
