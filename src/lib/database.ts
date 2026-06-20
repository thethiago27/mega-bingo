import { get, onValue, push, ref, set, update } from 'firebase/database';
import { generateCard, MAX_NUMBER } from '@/lib/bingo';
import { getDb } from '@/lib/firebase-utils';
import type { Player, Room } from '@/lib/types';

// Re-export types for convenience
export type { GameState, Player, Room, Winner } from '@/lib/types';

/**
 * Creates a new room owned by the given admin and returns its id.
 */
export async function createRoom(
  adminId: string,
  name = 'Sala do Admin'
): Promise<string> {
  const db = getDb();
  const roomsRef = ref(db, 'rooms');
  const newRoomRef = push(roomsRef);

  await set(newRoomRef, {
    name,
    adminId,
    createdAt: Date.now(),
    gameState: 'in_progress',
    currentRound: 1,
    drawnNumbers: [],
    winners: [],
  });

  return newRoomRef.key!;
}

/**
 * Adds a player to a room and returns the new player id.
 */
export async function addPlayer(roomId: string, name: string): Promise<string> {
  const db = getDb();
  const playersRef = ref(db, `rooms/${roomId}/players`);
  const newPlayerRef = push(playersRef);

  await set(newPlayerRef, {
    name,
    cardNumbers: generateCard(),
    markedNumbers: [],
    joinedAt: Date.now(),
  });

  return newPlayerRef.key;
}

/**
 * Draws a new unique number for the room. Returns null if the room does not
 * exist or every number has already been drawn.
 */
export async function drawNumber(roomId: string): Promise<number | null> {
  const db = getDb();
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) return null;

  const room = snapshot.val();
  const drawnNumbers: number[] = room.drawnNumbers || [];

  if (drawnNumbers.length >= MAX_NUMBER) return null;

  let newNumber: number;
  do {
    newNumber = Math.floor(Math.random() * MAX_NUMBER) + 1;
  } while (drawnNumbers.includes(newNumber));

  await update(roomRef, {
    drawnNumbers: [...drawnNumbers, newNumber],
  });

  return newNumber;
}

export function listenRoom(
  roomId: string,
  callback: (room: Room | null) => void
) {
  const db = getDb();
  const roomRef = ref(db, `rooms/${roomId}`);

  return onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: roomId, ...snapshot.val() });
    } else {
      callback(null);
    }
  });
}

export function listenPlayers(
  roomId: string,
  callback: (players: Record<string, Player>) => void
) {
  const db = getDb();
  const playersRef = ref(db, `rooms/${roomId}/players`);

  return onValue(playersRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback({});
    }
  });
}

export async function markNumber(
  roomId: string,
  playerId: string,
  number: number
): Promise<void> {
  const db = getDb();
  const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
  const snapshot = await get(playerRef);

  if (!snapshot.exists()) return;

  const player = snapshot.val();
  const markedNumbers: number[] = player.markedNumbers || [];

  if (!markedNumbers.includes(number)) {
    await update(playerRef, {
      markedNumbers: [...markedNumbers, number],
    });
  }
}

export async function checkRoomExists(roomId: string): Promise<boolean> {
  const db = getDb();
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  return snapshot.exists();
}

/**
 * Registers a winner for the current round (idempotent per player + round).
 */
export async function registerWinner(
  roomId: string,
  playerId: string,
  name: string
): Promise<void> {
  const db = getDb();
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) return;

  const room = snapshot.val();
  const winners = room.winners || [];
  const currentRound = room.currentRound || 1;

  const alreadyWonThisRound = winners.some(
    (w: { playerId: string; round: number }) =>
      w.playerId === playerId && w.round === currentRound
  );

  if (alreadyWonThisRound) return;

  await update(roomRef, {
    winners: [
      ...winners,
      {
        playerId,
        name,
        round: currentRound,
        timestamp: Date.now(),
      },
    ],
  });
}

/**
 * Starts a new round: clears drawn numbers, bumps the round counter and hands
 * every player a fresh card.
 */
export async function startNewRound(roomId: string): Promise<void> {
  const db = getDb();
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) return;

  const room = snapshot.val();
  const currentRound = room.currentRound || 1;

  await update(roomRef, {
    drawnNumbers: [],
    currentRound: currentRound + 1,
  });

  const playersRef = ref(db, `rooms/${roomId}/players`);
  const playersSnapshot = await get(playersRef);

  if (playersSnapshot.exists()) {
    const players = playersSnapshot.val();

    for (const playerId of Object.keys(players)) {
      const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
      await update(playerRef, {
        cardNumbers: generateCard(),
        markedNumbers: [],
      });
    }
  }
}
