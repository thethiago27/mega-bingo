"use client";

import { Room } from "@/lib/types";

interface WinnerNotificationProps {
  winner: Room["winner"];
  onEndGame: () => Promise<void>;
}

export function WinnerNotification({
  winner,
  onEndGame,
}: WinnerNotificationProps) {
  if (!winner) return null;

  const handleEndGame = async () => {
    if (confirm("Deseja encerrar o jogo agora?")) {
      await onEndGame();
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg rounded-lg p-6 border-4 border-yellow-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-6xl">🎉</div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">
            Temos um Vencedor!
          </h2>
          <p className="text-yellow-100">
            {winner.playerName} completou a cartela!
          </p>
        </div>
      </div>

      <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
        <p className="text-white text-sm">
          <span className="font-semibold">Horário da vitória:</span>{" "}
          {new Date(winner.winTime).toLocaleTimeString()}
        </p>
      </div>

      <button
        onClick={handleEndGame}
        className="w-full px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-yellow-50 transition"
      >
        Encerrar Jogo
      </button>
    </div>
  );
}
