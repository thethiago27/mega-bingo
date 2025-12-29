import { memo } from "react";

interface Player {
  playerId: string;
  nome: string;
  cartela: number[];
}

interface PlayersListProps {
  jogadores: Player[];
  numerosSorteados: number[];
  roomId: string;
}

export const PlayersList = memo(function PlayersList({
  jogadores,
  numerosSorteados,
  roomId,
}: PlayersListProps) {
  const playerCount = jogadores.length;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Jogadores ({playerCount})
      </h3>

      {playerCount === 0 ? (
        <p className="text-gray-600 text-center py-8">
          Nenhum jogador na sala ainda. Compartilhe o código{" "}
          <span className="font-mono font-bold">{roomId}</span> para que os
          jogadores entrem.
        </p>
      ) : (
        <div className="space-y-3">
          {jogadores.map((jogador) => {
            const numerosMarcados = jogador.cartela.filter((num) =>
              numerosSorteados.includes(num),
            );
            const progresso =
              (numerosMarcados.length / jogador.cartela.length) * 100;
            const isBingo = numerosMarcados.length === jogador.cartela.length;

            return (
              <div
                key={jogador.playerId}
                className={`p-4 border rounded-lg ${
                  isBingo ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">
                    {jogador.nome}
                    {isBingo && " 🎉"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {numerosMarcados.length}/{jogador.cartela.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isBingo ? "bg-green-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${progresso}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
