'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { RoomStatus } from '@/lib/types';

interface BingoHeaderProps {
  roomId: string;
  status: RoomStatus;
  currentRound?: number;
}

export default function BingoHeader({
  roomId,
  status,
  currentRound,
}: BingoHeaderProps) {
  const router = useRouter();

  const handleExit = () => {
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center px-4 h-16 justify-between max-w-md mx-auto w-full">
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="Voltar"
              className="text-gray-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Voltar para a tela inicial</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Deseja realmente voltar para a tela inicial?
            </DialogDescription>
            <DialogFooter>
              <Button onClick={handleExit}>Voltar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col items-center">
          <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            Sala #{roomId}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-blue-500">{status}</span>
            {currentRound && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-medium text-gray-500">
                  Rodada {currentRound}
                </span>
              </>
            )}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center h-10 px-3 rounded-full text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <span className="text-sm font-bold">Sair</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sair da sala</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Deseja realmente sair da sala?
            </DialogDescription>
            <DialogFooter>
              <Button onClick={handleExit}>Sair</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
