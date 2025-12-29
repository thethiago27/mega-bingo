"use client";

import { Room } from "@/lib/types";

interface PlayerListProps {
  players: Room["players"];
  drawnNumbers: number[];
}

export function PlayerList({ players, drawnNumbers }: PlayerListProps) {
  const playerArray = Object.entries(players).map(([id, data]) => ({
    id,
    ...data,
  }));

  if (playerArray.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Jogadores</h2>
        <p className="text-gray-600">
          Nenhum jogador na sala ainda. Compartilhe o código da sala para que os
          jogadores possam entrar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Jogadores ({playerArray.length})
      </h2>
      <div className="space-y-3">
        {playerArray.map((player) => {
          const markedCount = player.markedNumbers.length;
          const totalNumbers = player.cardNumbers.length;
          const percentage = (markedCount / totalNumbers) * 100;

          return (
            <div
              key={player.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{player.name}</h3>
                  <p className="text-sm text-gray-600">
                    Entrou em {new Date(player.joinedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {markedCount} / {totalNumbers}
                  </p>
                  <p className="text-xs text-gray-600">números marcados</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
