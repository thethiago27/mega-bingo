'use client';

import { useParams } from 'next/navigation';
import BingoButton from '@/components/bingo/bingo-button';
import { BingoCard } from '@/components/bingo/bingo-card';
import BingoHeader from '@/components/bingo/bingo-header';
import CurrentNumber from '@/components/bingo/current-number';
import HistoryStrip from '@/components/bingo/history-strip';
import { useRoom } from '@/hooks/use-room';
import { RoomStatus } from '@/lib/types';
import { RoomLoader } from './room-loader';
import { RoomNotFound } from './room-not-found';

export function Room() {
  const params = useParams();
  const roomId = params.id as string;

  const { room, loading, error } = useRoom(roomId);

  if (loading) {
    return <RoomLoader />;
  }

  if (error || !room) {
    return <RoomNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <BingoHeader
        roomId={roomId}
        status={
          room.gameState === 'completed'
            ? RoomStatus.FINISHED
            : RoomStatus.IN_PLAY
        }
        currentRound={room.currentRound}
      />

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full pb-24 overflow-x-hidden">
        <CurrentNumber roomId={roomId} />

        {room.drawnNumbers && room.drawnNumbers.length > 0 && (
          <HistoryStrip roomId={roomId} />
        )}

        <BingoCard roomId={roomId} />

        <div className="h-6"></div>
      </div>

      <BingoButton />
    </div>
  );
}
