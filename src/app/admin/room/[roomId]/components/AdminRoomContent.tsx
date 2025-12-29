'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  listenRoom,
  listenPlayers,
  drawNumber,
  registrarVencedor,
  iniciarNovaRodada,
  Sala as SalaDB,
  Jogador as JogadorDB,
} from '@/lib/database';
import { RoomHeader } from './RoomHeader';
import { NumberDrawer } from './NumberDrawer';
import { PlayersList } from './PlayersList';
import { DrawnNumbersGrid } from './DrawnNumbersGrid';
import { RoomStats } from './RoomStats';

export function AdminRoomContent() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [sala, setSala] = useState<SalaDB | null>(null);
  const [jogadores, setJogadores] = useState<Record<string, JogadorDB>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [startingNewRound, setStartingNewRound] = useState(false);

  useEffect(() => {
    const unsubscribeRoom = listenRoom(roomId, (salaData) => {
      if (salaData) {
        setSala(salaData);
        setError(null);
      } else {
        setError('Sala não encontrada');
      }
      setLoading(false);
    });

    const unsubscribePlayers = listenPlayers(roomId, (jogadoresData) => {
      setJogadores(jogadoresData);
    });

    return () => {
      unsubscribeRoom();
      unsubscribePlayers();
    };
  }, [roomId]);

  const numerosSorteados = sala?.numerosSorteados || [];
  const rodadaAtual = sala?.rodadaAtual || 1;

  const jogadoresArray = Object.entries(jogadores).map(
    ([playerId, jogador]) => ({
      playerId,
      ...jogador,
    })
  );

  const vencedoresRodadaAtual = jogadoresArray.filter((jogador) => {
    const numerosMarcados = jogador.cartela.filter((num) =>
      numerosSorteados.includes(num)
    );
    return numerosMarcados.length === jogador.cartela.length;
  });

  useEffect(() => {
    if (vencedoresRodadaAtual.length > 0 && sala) {
      const vencedoresJaRegistrados = sala.vencedores || [];

      for (const vencedor of vencedoresRodadaAtual) {
        const jaRegistrado = vencedoresJaRegistrados.some(
          (v) => v.jogadorId === vencedor.playerId && v.rodada === rodadaAtual
        );

        if (!jaRegistrado) {
          registrarVencedor(roomId, vencedor.playerId, vencedor.nome);
        }
      }
    }
  }, [vencedoresRodadaAtual, sala, roomId, rodadaAtual]);

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
      await iniciarNovaRodada(roomId);
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

  if (error || !sala) {
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
            onClick={handleGoBack}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const playerCount = Object.keys(jogadores).length;
  const currentNumber =
    numerosSorteados.length > 0
      ? numerosSorteados[numerosSorteados.length - 1]
      : null;

  const hasWinner = vencedoresRodadaAtual.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
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
        numerosSorteados={numerosSorteados}
        vencedores={vencedoresRodadaAtual}
        rodadaAtual={rodadaAtual}
        onNewRound={handleNewRound}
        startingNewRound={startingNewRound}
        hasWinner={hasWinner}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <NumberDrawer
            currentNumber={currentNumber}
            drawing={drawing}
            numerosSorteados={numerosSorteados}
            onDrawNumber={handleDrawNumber}
            disabled={hasWinner}
          />

          <RoomStats
            playerCount={playerCount}
            numerosSorteados={numerosSorteados}
            vencedores={vencedoresRodadaAtual}
            rodadaAtual={rodadaAtual}
            totalVencedores={sala.vencedores?.length || 0}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <PlayersList
            jogadores={jogadoresArray}
            numerosSorteados={numerosSorteados}
            roomId={roomId}
          />

          <DrawnNumbersGrid numerosSorteados={numerosSorteados} />
        </div>
      </div>
    </div>
  );
}
