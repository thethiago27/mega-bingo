import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addPlayer,
  listenPlayers,
  listenRoom,
  markNumber,
  type Room,
} from '@/lib/database';

interface UseRoomReturn {
  room: Room | null;
  playerId: string | null;
  cardNumbers: number[];
  markedNumbers: number[];
  drawnNumbers: number[];
  loading: boolean;
  error: string | null;
  isBingo: boolean;
  totalNumbers: number;
  currentNumber: number | null;
  handleMarkNumber: (number: number) => void;
}

function calculateMarkedNumbers(
  cardNumbers: number[],
  drawnNumbers: number[]
): number[] {
  return cardNumbers.filter((num) => drawnNumbers.includes(num));
}

// Helpers to persist the playerId in localStorage
function getStoredPlayerId(roomId: string, playerName: string): string | null {
  if (typeof window === 'undefined') return null;
  const key = `player-${roomId}-${playerName}`;
  return localStorage.getItem(key);
}

function setStoredPlayerId(
  roomId: string,
  playerName: string,
  playerId: string
): void {
  if (typeof window === 'undefined') return;
  const key = `player-${roomId}-${playerName}`;
  localStorage.setItem(key, playerId);
}

export function useRoom(roomId: string): UseRoomReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [cardNumbers, setCardNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isInitialized = useRef(false);

  // Redirect if no name
  useEffect(() => {
    if (!name && !loading) {
      router.push('/entrar');
    }
  }, [name, router, loading]);

  // Initialize player
  useEffect(() => {
    if (!name || isInitialized.current) return;

    isInitialized.current = true;

    const initPlayer = async () => {
      try {
        const storedPlayerId = getStoredPlayerId(roomId, name);

        if (storedPlayerId) {
          setPlayerId(storedPlayerId);
          setLoading(false);
          return;
        }

        const newPlayerId = await addPlayer(roomId, name);

        setStoredPlayerId(roomId, name, newPlayerId);

        setPlayerId(newPlayerId);
        setLoading(false);
      } catch {
        setError('Não foi possível entrar na sala. Tente novamente.');
        setLoading(false);
      }
    };

    initPlayer();
  }, [roomId, name]);

  useEffect(() => {
    if (!playerId) return;

    const unsubscribe = listenPlayers(roomId, (players) => {
      const player = players[playerId];

      if (!player) {
        if (name) {
          localStorage.removeItem(`player-${roomId}-${name}`);
        }
        return;
      }

      const cardFromFirebase = player.cardNumbers || [];

      if (cardFromFirebase.length > 0) {
        setCardNumbers(cardFromFirebase);
      }
    });

    return () => unsubscribe();
  }, [roomId, playerId, name]);

  useEffect(() => {
    const unsubscribe = listenRoom(roomId, (roomData) => {
      if (roomData) {
        setRoom(roomData);
      } else {
        setError('Sala não encontrada');
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleMarkNumber = useCallback(
    async (number: number) => {
      if (!playerId) return;

      try {
        await markNumber(roomId, playerId, number);
      } catch {
        // Silently fail
      }
    },
    [playerId, roomId]
  );

  const drawnNumbers = useMemo(
    () => room?.drawnNumbers || [],
    [room?.drawnNumbers]
  );

  const markedNumbers = useMemo(
    () =>
      cardNumbers.length > 0
        ? calculateMarkedNumbers(cardNumbers, drawnNumbers)
        : [],
    [cardNumbers, drawnNumbers]
  );

  const isBingo = useMemo(
    () => cardNumbers.length > 0 && markedNumbers.length === cardNumbers.length,
    [cardNumbers.length, markedNumbers.length]
  );

  const currentNumber = useMemo(
    () =>
      drawnNumbers && drawnNumbers.length > 0
        ? drawnNumbers[drawnNumbers.length - 1]
        : null,
    [drawnNumbers]
  );

  return {
    drawnNumbers,
    room,
    playerId,
    cardNumbers,
    currentNumber,
    markedNumbers,
    loading,
    error,
    isBingo,
    handleMarkNumber,
    totalNumbers: cardNumbers.length,
  };
}
