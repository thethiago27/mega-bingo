'use client';

import { GameState } from '@/lib/types';
import { useState } from 'react';

interface GameControlsProps {
  gameState: GameState;
  onStartGame: () => Promise<void>;
  onEndGame: () => Promise<void>;
  playerCount: number;
}

export function GameControls({
  gameState,
  onStartGame,
  onEndGame,
  playerCount,
}: GameControlsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = async () => {
    setLoading(true);
    setError(null);
    try {
      await onStartGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar jogo');
    } finally {
      setLoading(false);
    }
  };

  const handleEndGame = async () => {
    if (!confirm('Tem certeza que deseja encerrar o jogo?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onEndGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao encerrar jogo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Controles do Jogo
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {gameState === 'waiting' && (
          <>
            <button
              onClick={handleStartGame}
              disabled={loading || playerCount === 0}
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Iniciando...' : 'Iniciar Jogo'}
            </button>
            {playerCount === 0 && (
              <p className="text-sm text-gray-600 text-center">
                Aguardando jogadores entrarem na sala
              </p>
            )}
          </>
        )}

        {gameState === 'in_progress' && (
          <button
            onClick={handleEndGame}
            disabled={loading}
            className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Encerrando...' : 'Encerrar Jogo'}
          </button>
        )}

        {gameState === 'completed' && (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-700 font-medium">Jogo Finalizado</p>
          </div>
        )}
      </div>
    </div>
  );
}
