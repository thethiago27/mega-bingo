import { ref, push, set, onValue, update, get } from 'firebase/database';
import { getDb } from '@/lib/firebase-utils';
import { gerarCartela } from '@/lib/bingo';
import { Room, GameState, Sala, Jogador } from '@/lib/types';

// Re-export types for backwards compatibility
export type { Sala, Jogador, Vencedor } from '@/lib/types';

export async function createRoom(nome: string): Promise<string> {
  const db = getDb();
  const salasRef = ref(db, 'salas');
  const novaSalaRef = push(salasRef);

  await set(novaSalaRef, {
    nome,
    criadoEm: Date.now(),
    ativa: true,
    numerosSorteados: [],
    rodadaAtual: 1,
    vencedores: [],
  });

  return novaSalaRef.key!;
}

export async function addPlayer(salaId: string, nome: string): Promise<string> {
  const db = getDb();
  const jogadoresRef = ref(db, `salas/${salaId}/jogadores`);
  const novoJogadorRef = push(jogadoresRef);

  await set(novoJogadorRef, {
    nome,
    cartela: gerarCartela(),
    numerosMarcados: [],
  });

  return novoJogadorRef.key!;
}

export async function drawNumber(salaId: string): Promise<number | null> {
  const db = getDb();
  const salaRef = ref(db, `salas/${salaId}`);
  const snapshot = await get(salaRef);

  if (!snapshot.exists()) return null;

  const sala = snapshot.val();
  const numerosSorteados = sala.numerosSorteados || [];

  if (numerosSorteados.length >= 60) return null;

  let novoNumero: number;
  do {
    novoNumero = Math.floor(Math.random() * 60) + 1;
  } while (numerosSorteados.includes(novoNumero));

  await update(salaRef, {
    numerosSorteados: [...numerosSorteados, novoNumero],
  });

  return novoNumero;
}

export function listenRoom(
  salaId: string,
  callback: (sala: Sala | null) => void
) {
  const db = getDb();
  const salaRef = ref(db, `salas/${salaId}`);

  return onValue(salaRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: salaId, ...snapshot.val() });
    } else {
      callback(null);
    }
  });
}

export function listenPlayers(
  salaId: string,
  callback: (jogadores: Record<string, Jogador>) => void
) {
  const db = getDb();
  const jogadoresRef = ref(db, `salas/${salaId}/jogadores`);

  return onValue(jogadoresRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback({});
    }
  });
}

export async function markNumber(
  salaId: string,
  jogadorId: string,
  numero: number
) {
  const db = getDb();
  const jogadorRef = ref(db, `salas/${salaId}/jogadores/${jogadorId}`);
  const snapshot = await get(jogadorRef);

  if (!snapshot.exists()) return;

  const jogador = snapshot.val();
  const numerosMarcados = jogador.numerosMarcados || [];

  if (!numerosMarcados.includes(numero)) {
    await update(jogadorRef, {
      numerosMarcados: [...numerosMarcados, numero],
    });
  }
}

export async function checkRoomExists(salaId: string): Promise<boolean> {
  const db = getDb();
  const salaRef = ref(db, `salas/${salaId}`);
  const snapshot = await get(salaRef);
  return !!snapshot.exists();
}

// Admin Dashboard Room Operations

/**
 * Creates a new admin room with initial state
 */
export async function createAdminRoom(adminId: string): Promise<string> {
  const db = getDb();
  const roomsRef = ref(db, 'admin_rooms');
  const newRoomRef = push(roomsRef);
  const roomId = newRoomRef.key!;

  const room: Room = {
    id: roomId,
    createdAt: Date.now(),
    gameState: 'waiting',
    adminId,
    players: {},
    drawnNumbers: [],
  };

  await set(newRoomRef, room);
  return roomId;
}

/**
 * Retrieves a room by ID
 */
export async function getAdminRoom(roomId: string): Promise<Room | null> {
  const db = getDb();
  const roomRef = ref(db, `admin_rooms/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.val() as Room;
}

/**
 * Updates room game state
 */
export async function updateRoomGameState(
  roomId: string,
  gameState: GameState
): Promise<void> {
  const db = getDb();
  const roomRef = ref(db, `admin_rooms/${roomId}`);
  await update(roomRef, { gameState });
}

/**
 * Adds a player to a room
 */
export async function addPlayerToAdminRoom(
  roomId: string,
  playerId: string,
  playerName: string,
  cardNumbers: number[]
): Promise<void> {
  const db = getDb();
  const playerRef = ref(db, `admin_rooms/${roomId}/players/${playerId}`);
  await set(playerRef, {
    name: playerName,
    cardNumbers,
    markedNumbers: [],
    joinedAt: Date.now(),
  });
}

/**
 * Removes a player from a room
 */
export async function removePlayerFromAdminRoom(
  roomId: string,
  playerId: string
): Promise<void> {
  const db = getDb();
  const playerRef = ref(db, `admin_rooms/${roomId}/players/${playerId}`);
  await set(playerRef, null);
}

/**
 * Draws a number in a room
 */
export async function drawNumberInAdminRoom(
  roomId: string
): Promise<number | null> {
  const db = getDb();
  const roomRef = ref(db, `admin_rooms/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) return null;

  const room = snapshot.val() as Room;
  const drawnNumbers = room.drawnNumbers || [];

  if (drawnNumbers.length >= 100) return null;

  let newNumber: number;
  do {
    newNumber = Math.floor(Math.random() * 100) + 1;
  } while (drawnNumbers.includes(newNumber));

  await update(roomRef, {
    drawnNumbers: [...drawnNumbers, newNumber],
  });

  return newNumber;
}

/**
 * Marks a number on a player's card
 */
export async function markNumberOnPlayerCard(
  roomId: string,
  playerId: string,
  number: number
): Promise<void> {
  const db = getDb();
  const playerRef = ref(db, `admin_rooms/${roomId}/players/${playerId}`);
  const snapshot = await get(playerRef);

  if (!snapshot.exists()) return;

  const player = snapshot.val();
  const markedNumbers = player.markedNumbers || [];

  if (!markedNumbers.includes(number)) {
    await update(playerRef, {
      markedNumbers: [...markedNumbers, number],
    });
  }
}

/**
 * Sets a winner for a room
 */
export async function setRoomWinner(
  roomId: string,
  playerId: string,
  playerName: string
): Promise<void> {
  const db = getDb();
  const roomRef = ref(db, `admin_rooms/${roomId}`);
  await update(roomRef, {
    winner: {
      playerId,
      playerName,
      winTime: Date.now(),
    },
    gameState: 'completed',
    completedAt: Date.now(),
  });
}

/**
 * Listens to room updates in real-time
 */
export function listenToAdminRoom(
  roomId: string,
  callback: (room: Room | null) => void
): () => void {
  const db = getDb();
  const roomRef = ref(db, `admin_rooms/${roomId}`);

  const unsubscribe = onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as Room);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

/**
 * Listens to players in a room in real-time
 */
export function listenToRoomPlayers(
  roomId: string,
  callback: (players: Room['players']) => void
): () => void {
  const db = getDb();
  const playersRef = ref(db, `admin_rooms/${roomId}/players`);

  const unsubscribe = onValue(playersRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as Room['players']);
    } else {
      callback({});
    }
  });

  return unsubscribe;
}

/**
 * Retrieves all active rooms for an admin
 */
export async function getAdminRooms(adminId: string): Promise<Room[]> {
  const db = getDb();
  const roomsRef = ref(db, 'admin_rooms');
  const snapshot = await get(roomsRef);

  if (!snapshot.exists()) {
    return [];
  }

  const allRooms = snapshot.val() as Record<string, Room>;
  return Object.values(allRooms).filter((room) => room.adminId === adminId);
}

/**
 * Retrieves completed rooms for an admin
 */
export async function getCompletedAdminRooms(adminId: string): Promise<Room[]> {
  const rooms = await getAdminRooms(adminId);
  return rooms.filter((room) => room.gameState === 'completed');
}

/**
 * Registers a winner for the current round
 */
export async function registrarVencedor(
  salaId: string,
  jogadorId: string,
  nome: string
): Promise<void> {
  const db = getDb();
  const salaRef = ref(db, `salas/${salaId}`);
  const snapshot = await get(salaRef);

  if (!snapshot.exists()) return;

  const sala = snapshot.val();
  const vencedores = sala.vencedores || [];
  const rodadaAtual = sala.rodadaAtual || 1;

  const jaVenceuNaRodada = vencedores.some(
    (v: { jogadorId: string; rodada: number }) =>
      v.jogadorId === jogadorId && v.rodada === rodadaAtual
  );

  if (jaVenceuNaRodada) return;

  await update(salaRef, {
    vencedores: [
      ...vencedores,
      {
        jogadorId,
        nome,
        rodada: rodadaAtual,
        timestamp: Date.now(),
      },
    ],
  });
}

/**
 * Starts a new round - resets drawn numbers and generates new cards for all players
 */
export async function iniciarNovaRodada(salaId: string): Promise<void> {
  const db = getDb();
  const salaRef = ref(db, `salas/${salaId}`);
  const snapshot = await get(salaRef);

  if (!snapshot.exists()) return;

  const sala = snapshot.val();
  const rodadaAtual = sala.rodadaAtual || 1;

  await update(salaRef, {
    numerosSorteados: [],
    rodadaAtual: rodadaAtual + 1,
  });

  const jogadoresRef = ref(db, `salas/${salaId}/jogadores`);
  const jogadoresSnapshot = await get(jogadoresRef);

  if (jogadoresSnapshot.exists()) {
    const jogadores = jogadoresSnapshot.val();
    const updates: Record<
      string,
      { cartela: number[]; numerosMarcados: number[] }
    > = {};

    for (const jogadorId of Object.keys(jogadores)) {
      updates[jogadorId] = {
        cartela: gerarCartela(),
        numerosMarcados: [],
      };
    }

    for (const [jogadorId, data] of Object.entries(updates)) {
      const jogadorRef = ref(db, `salas/${salaId}/jogadores/${jogadorId}`);
      await update(jogadorRef, data);
    }
  }
}
