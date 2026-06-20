'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  drawNumber,
  listenPlayers,
  listenRoom,
  type Player,
  type Room,
  registerWinner,
  startNewRound,
} from '@/lib/database';
import { DrawnNumbersGrid } from './DrawnNumbersGrid';
import { NumberDrawer } from './NumberDrawer';
import { PlayersList } from './PlayersList';
import { RoomHeader } from './RoomHeader';
import { RoomStats } from './RoomStats';

export function AdminRoomContent() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [startingNewRound, setStartingNewRound] = useState(false);

  useEffect(() => {
    const unsubscribeRoom = listenRoom(roomId, (roomData) => {
      if (roomData) {
        setRoom(roomData);
        setError(null);
      } else {
        setError('Sala não encontrada');
      }
      setLoading(false);
    });

    const unsubscribePlayers = listenPlayers(roomId, (playersData) => {
      setPlayers(playersData);
    });

    return () => {
      unsubscribeRoom();
      unsubscribePlayers();
    };
  }, [roomId]);

  const drawnNumbers = room?.drawnNumbers || [];
  const currentRound = room?.currentRound || 1;

  const playersArray = Object.entries(players).map(([playerId, player]) => ({
    playerId,
    ...player,
  }));

  const roundWinners = playersArray.filter((player) => {
    const markedNumbers = player.cardNumbers.filter((num) =>
      drawnNumbers.includes(num)
    );
    return markedNumbers.length === player.cardNumbers.length;
  });

  useEffect(() => {
    if (roundWinners.length > 0 && room) {
      const registeredWinners = room.winners || [];

      for (const winner of roundWinners) {
        const alreadyRegistered = registeredWinners.some(
          (w) => w.playerId === winner.playerId && w.round === currentRound
        );

        if (!alreadyRegistered) {
          registerWinner(roomId, winner.playerId, winner.name);
        }
      }
    }
  }, [roundWinners, room, roomId, currentRound]);

  const handleDrawNumber = useCallback(async () => {
    setDrawing(true);
    try {
      await drawNumber(roomId);
    } catch {
      setError('Erro ao sortear número');
    } finally {
      setDrawing(false);
    }
  }, [roomId]);

  const handleNewRound = useCallback(async () => {
    setStartingNewRound(true);
    try {
      await startNewRound(roomId);
    } catch {
      setError('Erro ao iniciar nova rodada');
    } finally {
      setStartingNewRound(false);
    }
  }, [roomId]);

  const handleGoBack = useCallback(() => {
    router.push('/admin');
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sala...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">
            Erro ao Carregar Sala
          </h2>
          <p className="text-red-700 mb-4">
            {error ||
              'Sala não encontrada. Verifique o código e tente novamente.'}
          </p>
          <button
            type="button"
            onClick={handleGoBack}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const playerCount = Object.keys(players).length;
  const currentNumber =
    drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1] : null;

  const hasWinner = roundWinners.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleGoBack}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar ao Dashboard
        </button>
      </div>

      <RoomHeader
        roomId={roomId}
        playerCount={playerCount}
        drawnNumbers={drawnNumbers}
        winners={roundWinners}
        currentRound={currentRound}
        onNewRound={handleNewRound}
        startingNewRound={startingNewRound}
        hasWinner={hasWinner}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <NumberDrawer
            currentNumber={currentNumber}
            drawing={drawing}
            drawnNumbers={drawnNumbers}
            onDrawNumber={handleDrawNumber}
            disabled={hasWinner}
          />

          <RoomStats
            playerCount={playerCount}
            drawnNumbers={drawnNumbers}
            winners={roundWinners}
            currentRound={currentRound}
            totalWinners={room.winners?.length || 0}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <PlayersList
            players={playersArray}
            drawnNumbers={drawnNumbers}
            roomId={roomId}
          />

          <DrawnNumbersGrid drawnNumbers={drawnNumbers} />
        </div>
      </div>
    </div>
  );
}
