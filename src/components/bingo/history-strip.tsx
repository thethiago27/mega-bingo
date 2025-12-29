'use client';

import { useRoom } from '@/hooks/use-room';

interface HistoryStripProps {
  roomId: string;
}

export default function HistoryStrip({ roomId }: HistoryStripProps) {
  const { numerosSorteados, currentNumber } = useRoom(roomId);

  const ultimosNumeros = numerosSorteados.slice(-4);

  return (
    <section className="w-full border-y border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 py-3 overflow-hidden">
      <div className="flex items-center gap-4 px-4 overflow-x-auto no-scrollbar">
        {ultimosNumeros.map((numero, index) => {
          const isAtual = numero === currentNumber;
          const ordem = numerosSorteados.indexOf(numero) + 1;
          const opacity = isAtual
            ? 1
            : index === ultimosNumeros.length - 2
              ? 0.9
              : 0.7;

          return (
            <div
              key={`${numero}-${index}`}
              className="flex items-center gap-4 shrink-0"
            >
              <div
                className="flex flex-col items-center gap-1"
                style={{ opacity }}
              >
                <span
                  className={`text-[10px] font-bold ${isAtual ? 'text-blue-500' : 'text-gray-400'}`}
                >
                  #{ordem}
                </span>
                <div
                  className={`size-10 rounded-full flex items-center justify-center font-bold ${
                    isAtual
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {numero.toString().padStart(2, '0')}
                </div>
              </div>

              {index < ultimosNumeros.length - 1 && (
                <div className="w-4 h-[2px] bg-gray-200 dark:bg-gray-700 shrink-0 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
