"use client";

import { memo, useCallback } from "react";
import { Check, Pointer } from "lucide-react";

interface BingoNumberProps {
  numero: number;
  isMarcado: boolean;
  isAtual: boolean;
  onMark: (numero: number) => void;
}

export const BingoNumber = memo(function BingoNumber({
  numero,
  isMarcado,
  isAtual,
  onMark,
}: BingoNumberProps) {
  const handleClick = useCallback(() => {
    if (!isMarcado) {
      onMark(numero);
    }
  }, [isMarcado, numero, onMark]);

  return (
    <button
      onClick={handleClick}
      disabled={isMarcado}
      className={`group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all active:scale-95 ${
        isMarcado
          ? "bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/20"
          : isAtual
            ? "bg-white dark:bg-gray-800 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10 animate-pulse"
            : "bg-white dark:bg-gray-800 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <span
        className={`text-3xl font-bold ${
          isMarcado
            ? "text-white"
            : isAtual
              ? "text-blue-500"
              : "text-gray-900 dark:text-white opacity-90"
        }`}
      >
        {numero.toString().padStart(2, "0")}
      </span>

      <div
        className={`size-8 rounded-full flex items-center justify-center ${
          isMarcado
            ? "bg-white/20"
            : isAtual
              ? "border-2 border-blue-500 bg-blue-500/10"
              : "border-2 border-gray-200 dark:border-gray-600 group-hover:bg-gray-100 dark:group-hover:bg-gray-700/50"
        }`}
      >
        {isMarcado ? (
          <span className="material-symbols-outlined text-white">
            <Check />
          </span>
        ) : isAtual ? (
          <span className="material-symbols-outlined text-blue-500 text-sm">
            <Pointer />
          </span>
        ) : null}
      </div>
    </button>
  );
});
