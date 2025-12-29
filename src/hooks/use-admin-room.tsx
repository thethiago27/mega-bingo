'use client';

import { useEffect, useState } from 'react';
import {
  listenToAdminRoom,
  updateRoomGameState,
  drawNumberInAdminRoom,
} from '@/lib/database';
import { Room, GameState } from '@/lib/types';

interface UseAdminRoomReturn {
  room: Room | null;
  loading: boolean;
  error: string | null;
  startGame: () => Promise<void>;
  endGame: () => Promise<void>;
  drawNumber: () => Promise<number | null>;
  players: Room['players'];
  drawnNumbers: number[];
  gameState: GameState | null;
}

export function useAdminRoom(roomId: string): UseAdminRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setError('Room ID is required');
      setLoading(false);
      return;
    }

    let mounted = true;

    const unsubscribe = listenToAdminRoom(roomId, (roomData) => {
      if (!mounted) return;

      if (roomData) {
        setRoom(roomData);
        setError(null);
      } else {
        setError('Room not found');
        setRoom(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [roomId]);

  const startGame = async (): Promise<void> => {
    if (!room) {
      throw new Error('Room not loaded');
    }

    if (room.gameState !== 'waiting') {
      throw new Error('Game can only be started from waiting state');
    }

    await updateRoomGameState(roomId, 'in_progress');
  };

  const endGame = async (): Promise<void> => {
    if (!room) {
      throw new Error('Room not loaded');
    }

    if (room.gameState === 'completed') {
      throw new Error('Game is already completed');
    }

    await updateRoomGameState(roomId, 'completed');
  };

  const drawNumber = async (): Promise<number | null> => {
    if (!room) {
      throw new Error('Room not loaded');
    }

    if (room.gameState !== 'in_progress') {
      throw new Error('Can only draw numbers when game is in progress');
    }

    const drawnNumber = await drawNumberInAdminRoom(roomId);
    return drawnNumber;
  };

  const players = room?.players || {};
  const drawnNumbers = room?.drawnNumbers || [];
  const gameState = room?.gameState || null;

  return {
    room,
    loading,
    error,
    startGame,
    endGame,
    drawNumber,
    players,
    drawnNumbers,
    gameState,
  };
}
