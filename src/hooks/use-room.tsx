import { Sala, addPlayer, listenRoom, listenPlayers } from '@/lib/database';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { markNumber } from '@/lib/database';

interface UseRoomReturn {
  sala: Sala | null;
  jogadorId: string | null;
  cartela: number[];
  numerosMarcados: number[];
  numerosSorteados: number[];
  loading: boolean;
  error: string | null;
  isBingo: boolean;
  totalNumeros: number;
  currentNumber: number | null;
  handleMarkNumber: (numero: number) => void;
}

function calculateMarkedNumbers(
  cartela: number[],
  numerosSorteados: number[]
): number[] {
  return cartela.filter((num) => numerosSorteados.includes(num));
}

// Funções para gerenciar jogadorId no localStorage
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
  const nome = searchParams.get('nome');

  const [sala, setSala] = useState<Sala | null>(null);
  const [jogadorId, setJogadorId] = useState<string | null>(null);
  const [cartela, setCartela] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isInitialized = useRef(false);

  // Redirect if no name
  useEffect(() => {
    if (!nome && !loading) {
      router.push('/entrar');
    }
  }, [nome, router, loading]);

  // Initialize player
  useEffect(() => {
    if (!nome || isInitialized.current) return;

    isInitialized.current = true;

    const initPlayer = async () => {
      try {
        const storedPlayerId = getStoredPlayerId(roomId, nome);

        if (storedPlayerId) {
          setJogadorId(storedPlayerId);
          setLoading(false);
          return;
        }

        const playerId = await addPlayer(roomId, nome);

        setStoredPlayerId(roomId, nome, playerId);

        setJogadorId(playerId);
        setLoading(false);
      } catch {
        setError('Não foi possível entrar na sala. Tente novamente.');
        setLoading(false);
      }
    };

    initPlayer();
  }, [roomId, nome, router]);

  useEffect(() => {
    if (!jogadorId) return;

    const unsubscribe = listenPlayers(roomId, (jogadores) => {
      const jogador = jogadores[jogadorId];

      if (!jogador) {
        if (nome) {
          localStorage.removeItem(`player-${roomId}-${nome}`);
        }
        return;
      }

      const cartelaFirebase = jogador.cartela || [];

      if (cartelaFirebase.length > 0) {
        setCartela(cartelaFirebase);
      }
    });

    return () => unsubscribe();
  }, [roomId, jogadorId, nome]);

  useEffect(() => {
    const unsubscribe = listenRoom(roomId, (salaData) => {
      if (salaData) {
        setSala(salaData);
      } else {
        setError('Sala não encontrada');
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleMarkNumber = useCallback(
    async (numero: number) => {
      if (!jogadorId) return;

      try {
        await markNumber(roomId, jogadorId, numero);
      } catch {
        // Silently fail
      }
    },
    [jogadorId, roomId]
  );

  const numerosSorteados = useMemo(
    () => sala?.numerosSorteados || [],
    [sala?.numerosSorteados]
  );

  const numerosMarcados = useMemo(
    () =>
      cartela.length > 0
        ? calculateMarkedNumbers(cartela, numerosSorteados)
        : [],
    [cartela, numerosSorteados]
  );

  const isBingo = useMemo(
    () => cartela.length > 0 && numerosMarcados.length === cartela.length,
    [cartela.length, numerosMarcados.length]
  );

  const currentNumber = useMemo(
    () =>
      numerosSorteados && numerosSorteados.length > 0
        ? numerosSorteados[numerosSorteados.length - 1]
        : null,
    [numerosSorteados]
  );

  return {
    numerosSorteados,
    sala,
    jogadorId,
    cartela,
    currentNumber,
    numerosMarcados,
    loading,
    error,
    isBingo,
    handleMarkNumber,
    totalNumeros: cartela.length,
  };
}
