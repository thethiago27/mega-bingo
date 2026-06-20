import { memo } from 'react';
import { MAX_NUMBER } from '@/lib/bingo';

interface Player {
  playerId: string;
  name: string;
  cardNumbers: number[];
}

interface RoomStatsProps {
  playerCount: number;
  drawnNumbers: number[];
  winners: Player[];
  currentRound: number;
  totalWinners: number;
}

export const RoomStats = memo(function RoomStats({
  playerCount,
  drawnNumbers,
  winners,
  currentRound,
  totalWinners,
}: RoomStatsProps) {
  const progress = (drawnNumbers.length / MAX_NUMBER) * 100;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Rodada atual:</span>
          <span className="font-semibold text-blue-600">{currentRound}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Jogadores:</span>
          <span className="font-semibold text-gray-900">{playerCount}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Números sorteados:</span>
          <span className="font-semibold text-gray-900">
            {drawnNumbers.length}/{MAX_NUMBER}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Vencedores (rodada):</span>
          <span className="font-semibold text-green-600">{winners.length}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total de vitórias:</span>
          <span className="font-semibold text-gray-900">{totalWinners}</span>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Progresso da rodada
          </p>
        </div>
      </div>
    </div>
  );
});
