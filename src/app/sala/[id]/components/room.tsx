"use client";

import BingoButton from "@/components/bingo/bingo-button";
import BingoHeader from "@/components/bingo/bingo-header";
import CurrentNumber from "@/components/bingo/current-number";
import HistoryStrip from "@/components/bingo/history-strip";
import { BingoCard } from "@/components/bingo/bingo-card";
import { RoomLoader } from "./room-loader";
import { RoomNotFound } from "./room-not-found";
import { useParams } from "next/navigation";
import { useRoom } from "@/hooks/use-room";
import { RoomStatus } from "@/lib/types";

export function Room() {
  const params = useParams();
  const salaId = params.id as string;

  const { sala, loading, error } = useRoom(salaId);

  if (loading) {
    return <RoomLoader />;
  }

  if (error || !sala) {
    return <RoomNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <BingoHeader
        salaId={salaId}
        status={sala.ativa ? RoomStatus.IN_PLAY : RoomStatus.FINISHED}
        rodadaAtual={sala.rodadaAtual}
      />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pb-24 overflow-x-hidden">
        <CurrentNumber roomId={salaId} />

        {sala.numerosSorteados && sala.numerosSorteados.length > 0 && (
          <HistoryStrip roomId={salaId} />
        )}

        <BingoCard roomId={salaId} />

        <div className="h-6"></div>
      </main>

      <BingoButton />
    </div>
  );
}
