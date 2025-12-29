"use client";

import { memo, useState, useCallback } from "react";
import { Copy, Check, RotateCcw } from "lucide-react";

interface Player {
  playerId: string;
  nome: string;
  cartela: number[];
}

interface RoomHeaderProps {
  roomId: string;
  playerCount: number;
  numerosSorteados: number[];
  vencedores: Player[];
  rodadaAtual: number;
  onNewRound: () => Promise<void>;
  startingNewRound: boolean;
  hasWinner: boolean;
}

export const RoomHeader = memo(function RoomHeader({
  roomId,
  playerCount,
  numerosSorteados,
  vencedores,
  rodadaAtual,
  onNewRound,
  startingNewRound,
  hasWinner,
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/entrar/${roomId}`
      : "";

  const handleCopyLink = useCallback(() => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Sala {roomId}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              Rodada {rodadaAtual}
            </span>
          </div>
          <p className="text-gray-600">
            {playerCount} jogador(es) • {numerosSorteados.length} número(s)
            sorteado(s)
          </p>
        </div>

        {vencedores.length > 0 && (
          <div className="bg-green-100 border border-green-300 rounded-lg px-4 py-2">
            <p className="text-green-900 font-semibold">
              🎉 {vencedores.length} Vencedor(es)!
            </p>
            <div className="text-sm text-green-800 mt-1">
              {vencedores.map((v) => v.nome).join(", ")}
            </div>
          </div>
        )}
      </div>

      {hasWinner && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-yellow-900">
                Rodada {rodadaAtual} finalizada!
              </p>
              <p className="text-sm text-yellow-700">
                Inicie uma nova rodada para continuar o jogo. Todos os jogadores
                receberão novas cartelas.
              </p>
            </div>
            <button
              onClick={onNewRound}
              disabled={startingNewRound}
              className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 disabled:bg-yellow-300 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <RotateCcw
                className={`w-4 h-4 ${startingNewRound ? "animate-spin" : ""}`}
              />
              {startingNewRound ? "Iniciando..." : "Nova Rodada"}
            </button>
          </div>
        </div>
      )}

      {/* Share Link Section */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Link de Compartilhamento
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg font-mono text-gray-700"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Compartilhe este link com os jogadores para que entrem diretamente na
          sala sem precisar digitar o código
        </p>
      </div>
    </div>
  );
});
