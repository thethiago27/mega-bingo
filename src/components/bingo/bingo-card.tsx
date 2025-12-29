"use client";

import { useRoom } from "@/hooks/use-room";
import { useWinState } from "@/hooks/use-win-state";
import { CheckCircle } from "lucide-react";
import { AnimatedNumber } from "./animated-number";
import { CelebrationOverlay } from "./celebration-overlay";
import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface BingoCardProps {
  roomId: string;
}

export function BingoCard({ roomId }: BingoCardProps) {
  const searchParams = useSearchParams();
  const playerName = searchParams.get("nome") || "Jogador";

  const {
    numerosMarcados,
    totalNumeros,
    cartela,
    handleMarkNumber,
    currentNumber,
    loading,
  } = useRoom(roomId);

  const winState = useWinState(10, numerosMarcados.length);

  const onMarkNumber = useCallback(
    (numero: number) => {
      handleMarkNumber(numero);
    },
    [handleMarkNumber],
  );

  if (loading) {
    return (
      <section className="px-4 pt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando cartela...</p>
          </div>
        </div>
      </section>
    );
  }

  if (cartela.length === 0) {
    return (
      <section className="px-4 pt-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Aguardando cartela... Se o problema persistir, recarregue a página.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 dark:text-white text-lg font-bold">
            Sua Cartela
          </h3>
          <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-blue-500 text-sm">
              <CheckCircle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
              {numerosMarcados.length}/{totalNumeros} Marcados
            </span>
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-3 ${winState.cardClasses}`}>
          {cartela.map((numero) => {
            const isMarcado = numerosMarcados.includes(numero);
            const isAtual = numero === currentNumber;

            return (
              <button
                key={numero}
                onClick={() => !isMarcado && onMarkNumber(numero)}
                disabled={isMarcado}
                className="active:scale-95 transition-transform"
              >
                <AnimatedNumber
                  number={numero}
                  isMarked={isMarcado}
                  isNew={isAtual}
                />
              </button>
            );
          })}
        </div>
      </section>

      <CelebrationOverlay
        show={winState.shouldCelebrate}
        playerName={playerName}
      />
    </>
  );
}
