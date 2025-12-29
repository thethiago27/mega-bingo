"use client";

import { useRoom } from "@/hooks/use-room";
import { Lock } from "lucide-react";
import { useParams } from "next/navigation";

export default function BingoButton() {
  const params = useParams();
  const salaId = params.id as string;

  const { cartela, numerosMarcados } = useRoom(salaId);

  const handleBingo = () => {
    if (numerosMarcados.length === cartela.length) {
      alert("🎉 BINGO! Você ganhou!");
    }
  };

  const bingoCompleto =
    numerosMarcados.length === cartela.length && cartela.length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pointer-events-none flex justify-center pb-8">
      <button
        onClick={handleBingo}
        disabled={!bingoCompleto}
        className={`pointer-events-auto font-bold text-lg px-8 py-4 rounded-full w-full max-w-xs shadow-xl flex items-center justify-center gap-2 transition-all ${
          bingoCompleto
            ? "bg-green-500 hover:bg-green-600 text-white active:scale-95"
            : "bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed border border-gray-400/20 dark:border-white/10"
        }`}
      >
        {!bingoCompleto && (
          <span className="material-symbols-outlined">
            <Lock className="w-4 h-4" />
          </span>
        )}
        BINGO!
      </button>
    </div>
  );
}
