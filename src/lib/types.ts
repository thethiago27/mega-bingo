export interface Vencedor {
  jogadorId: string;
  nome: string;
  rodada: number;
  timestamp: number;
}

export interface Sala {
  id: string;
  nome: string;
  criadoEm: Date;
  ativa: boolean;
  numerosSorteados: number[];
  rodadaAtual: number;
  vencedores: Vencedor[];
}

export interface Jogador {
  id: string;
  nome: string;
  salaId: string;
  cartela: number[];
  numerosMarcados: number[];
}

export enum RoomStatus {
  IN_PLAY = "Em andamento",
  AWAITING_START = "Aguardando",
  FINISHED = "Finalizado",
}

// Admin Dashboard Room Interface
export type GameState = "waiting" | "in_progress" | "completed";

export interface Room {
  id: string;
  createdAt: number;
  gameState: GameState;
  adminId: string;
  players: {
    [playerId: string]: {
      name: string;
      cardNumbers: number[];
      markedNumbers: number[];
      joinedAt: number;
    };
  };
  drawnNumbers: number[];
  winner?: {
    playerId: string;
    playerName: string;
    winTime: number;
  };
  completedAt?: number;
}
