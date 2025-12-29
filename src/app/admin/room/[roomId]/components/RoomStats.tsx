import { memo } from "react";

interface Player {
  playerId: string;
  nome: string;
  cartela: number[];
}

interface RoomStatsProps {
  playerCount: number;
  numerosSorteados: number[];
  vencedores: Player[];
  rodadaAtual: number;
  totalVencedores: number;
}

export const RoomStats = memo(function RoomStats({
  playerCount,
  numerosSorteados,
  vencedores,
  rodadaAtual,
  totalVencedores,
}: RoomStatsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Rodada atual:</span>
          <span className="font-semibold text-blue-600">{rodadaAtual}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Jogadores:</span>
          <span className="font-semibold text-gray-900">{playerCount}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Números sorteados:</span>
          <span className="font-semibold text-gray-900">
            {numerosSorteados.length}/100
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Vencedores (rodada):</span>
          <span className="font-semibold text-green-600">
            {vencedores.length}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total de vitórias:</span>
          <span className="font-semibold text-gray-900">{totalVencedores}</span>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${numerosSorteados.length}%` }}
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
