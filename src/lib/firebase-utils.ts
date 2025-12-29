import { ref, get, Database } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { Sala } from "@/lib/types";
import { Auth } from "firebase/auth";

/**
 * Safely get database instance
 * Throws error if not initialized
 */
export function getDb(): Database {
  if (!db) {
    throw new Error("Firebase Database is not initialized");
  }
  return db;
}

/**
 * Safely get auth instance
 * Throws error if not initialized
 */
export function getAuth(): Auth {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }
  return auth;
}

/**
 * Safely loads all rooms from Firebase
 * Returns empty array if Firebase is not initialized (SSR/build time)
 */
export async function loadSalas(): Promise<Sala[]> {
  // Return empty array if Firebase is not initialized
  if (!db) {
    return [];
  }

  try {
    const salasRef = ref(db, "salas");
    const snapshot = await get(salasRef);

    if (snapshot.exists()) {
      const salasData = snapshot.val();
      return Object.entries(salasData).map(([id, sala]: [string, unknown]) => ({
        ...(sala as Omit<Sala, "id">),
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
  return typeof window !== "undefined" && !!db && !!auth;
}

/**
 * Check if Firebase Database is initialized
 */
export function isDbReady(): boolean {
  return typeof window !== "undefined" && !!db;
}

/**
 * Check if Firebase Auth is initialized
 */
export function isAuthReady(): boolean {
  return typeof window !== "undefined" && !!auth;
}
