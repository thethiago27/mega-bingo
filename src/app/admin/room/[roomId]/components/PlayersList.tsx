import { memo } from 'react';

interface Player {
  playerId: string;
  name: string;
  cardNumbers: number[];
}

interface PlayersListProps {
  players: Player[];
  drawnNumbers: number[];
  roomId: string;
}

export const PlayersList = memo(function PlayersList({
  players,
  drawnNumbers,
  roomId,
}: PlayersListProps) {
  const playerCount = players.length;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Jogadores ({playerCount})
      </h3>

      {playerCount === 0 ? (
        <p className="text-gray-600 text-center py-8">
          Nenhum jogador na sala ainda. Compartilhe o código{' '}
          <span className="font-mono font-bold">{roomId}</span> para que os
          jogadores entrem.
        </p>
      ) : (
        <div className="space-y-3">
          {players.map((player) => {
            const markedNumbers = player.cardNumbers.filter((num) =>
              drawnNumbers.includes(num)
            );
            const progress =
              (markedNumbers.length / player.cardNumbers.length) * 100;
            const isBingo = markedNumbers.length === player.cardNumbers.length;

            return (
              <div
                key={player.playerId}
                className={`p-4 border rounded-lg ${
                  isBingo ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">
                    {player.name}
                    {isBingo && ' 🎉'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {markedNumbers.length}/{player.cardNumbers.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isBingo ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progress}%` }}
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
