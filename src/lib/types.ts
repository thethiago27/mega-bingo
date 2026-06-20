export type GameState = 'waiting' | 'in_progress' | 'completed';

export interface Winner {
  playerId: string;
  name: string;
  round: number;
  timestamp: number;
}

export interface Player {
  name: string;
  cardNumbers: number[];
  markedNumbers: number[];
  joinedAt: number;
}

export interface Room {
  id: string;
  name: string;
  adminId: string;
  createdAt: number;
  gameState: GameState;
  currentRound: number;
  drawnNumbers: number[];
  winners: Winner[];
  players: Record<string, Player>;
}

export enum RoomStatus {
  IN_PLAY = 'Em andamento',
  AWAITING_START = 'Aguardando',
  FINISHED = 'Finalizado',
}
