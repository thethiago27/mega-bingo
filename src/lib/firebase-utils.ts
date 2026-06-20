import type { Auth } from 'firebase/auth';
import { type Database, get, ref } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import type { Room } from '@/lib/types';

/**
 * Safely get database instance
 * Throws error if not initialized
 */
export function getDb(): Database {
  if (!db) {
    throw new Error('Firebase Database is not initialized');
  }
  return db;
}

/**
 * Safely get auth instance
 * Throws error if not initialized
 */
export function getAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  return auth;
}

/**
 * Safely loads all rooms from Firebase
 * Returns empty array if Firebase is not initialized (SSR/build time)
 */
export async function loadRooms(): Promise<Room[]> {
  // Return empty array if Firebase is not initialized
  if (!db) {
    return [];
  }

  try {
    const roomsRef = ref(db, 'rooms');
    const snapshot = await get(roomsRef);

    if (snapshot.exists()) {
      const roomsData = snapshot.val();
      return Object.entries(roomsData).map(([id, room]: [string, unknown]) => ({
        ...(room as Omit<Room, 'id'>),
        id,
      }));
    }

    return [];
  } catch {
    // Silently fail and return empty array
    return [];
  }
}

/**
 * Check if Firebase is initialized and ready to use
 */
export function isFirebaseReady(): boolean {
  return typeof window !== 'undefined' && !!db && !!auth;
}

/**
 * Check if Firebase Database is initialized
 */
export function isDbReady(): boolean {
  return typeof window !== 'undefined' && !!db;
}

/**
 * Check if Firebase Auth is initialized
 */
export function isAuthReady(): boolean {
  return typeof window !== 'undefined' && !!auth;
}
