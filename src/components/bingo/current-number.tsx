"use client";

import { useRoom } from "@/hooks/use-room";

interface CurrentNumberProps {
  roomId: string;
  proximoEm?: number;
}

export default function CurrentNumber({
  roomId,
  proximoEm,
}: CurrentNumberProps) {
  const { currentNumber } = useRoom(roomId);
  return (
    <section className="flex flex-col items-center pt-6 pb-4 px-4">
      <h2 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">
        Número Sorteado
      </h2>

      <div className="relative flex items-center justify-center size-32 rounded-full bg-white dark:bg-gray-800 border-4 border-blue-500 shadow-lg shadow-blue-500/30 mb-2">
        <div className="absolute inset-0 rounded-full border border-gray-100 dark:border-white/10"></div>
        <span className="text-gray-900 dark:text-white text-6xl font-bold tracking-tighter">
          {currentNumber || "--"}
        </span>

        {currentNumber && (
          <div className="absolute -bottom-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white dark:border-gray-900">
            AGORA
          </div>
        )}
      </div>

      {proximoEm && (
        <p className="mt-6 text-gray-500 dark:text-gray-400 text-xs font-medium">
          Sorteando próximo em {proximoEm}s...
        </p>
      )}
    </section>
  );
}
