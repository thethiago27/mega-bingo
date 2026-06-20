'use client';

import { CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { useRoom } from '@/hooks/use-room';
import { useWinState } from '@/hooks/use-win-state';
import { CARD_SIZE } from '@/lib/bingo';
import { AnimatedNumber } from './animated-number';

const CelebrationOverlay = dynamic(
  () => import('./celebration-overlay').then((mod) => mod.CelebrationOverlay),
  { ssr: false }
);

interface BingoCardProps {
  roomId: string;
}

export function BingoCard({ roomId }: BingoCardProps) {
  const searchParams = useSearchParams();
  const playerName = searchParams.get('name') || 'Jogador';

  const {
    markedNumbers,
    totalNumbers,
    cardNumbers,
    handleMarkNumber,
    currentNumber,
    loading,
  } = useRoom(roomId);

  const winState = useWinState(CARD_SIZE, markedNumbers.length);

  const onMarkNumber = useCallback(
    (number: number) => {
      handleMarkNumber(number);
    },
    [handleMarkNumber]
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

  if (cardNumbers.length === 0) {
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
              {markedNumbers.length}/{totalNumbers} Marcados
            </span>
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-3 ${winState.cardClasses}`}>
          {cardNumbers.map((number) => {
            const isMarked = markedNumbers.includes(number);
            const isCurrent = number === currentNumber;

            return (
              <button
                key={number}
                onClick={() => !isMarked && onMarkNumber(number)}
                disabled={isMarked}
                className="active:scale-95 transition-transform"
              >
                <AnimatedNumber
                  number={number}
                  isMarked={isMarked}
                  isNew={isCurrent}
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
