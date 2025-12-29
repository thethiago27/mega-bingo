"use client";

import { GameState } from "@/lib/types";
import { useState } from "react";

interface RoomHeaderProps {
  roomId: string;
  gameState: GameState;
  playerCount: number;
}

export function RoomHeader({
  roomId,
  gameState,
  playerCount,
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail
    }
  };

  const getGameStateLabel = (state: GameState) => {
    switch (state) {
      case "waiting":
        return { label: "Aguardando", color: "bg-yellow-100 text-yellow-800" };
      case "in_progress":
        return { label: "Em andamento", color: "bg-green-100 text-green-800" };
      case "completed":
        return { label: "Finalizado", color: "bg-gray-100 text-gray-800" };
    }
  };

  const stateInfo = getGameStateLabel(gameState);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sala {roomId}
          </h1>
          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${stateInfo.color}`}
            >
              {stateInfo.label}
            </span>
            <span className="text-gray-600">
              {playerCount} jogador{playerCount !== 1 ? "es" : ""}
            </span>
          </div>
        </div>
        <div>
          <button
            onClick={handleCopyRoomId}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copiado!
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copiar Código
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
