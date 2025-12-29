"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface AdminSession {
  isAuthenticated: boolean;
  adminId: string;
}

interface UseAdminAuthReturn {
  isAuthenticated: boolean;
  adminId: string | null;
  loading: boolean;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// localStorage helpers
function getStoredSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("admin-session");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setStoredSession(session: AdminSession | null): void {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem("admin-session", JSON.stringify(session));
    } else {
      localStorage.removeItem("admin-session");
    }
  } catch {
    // Silently fail
  }
}

export function useAdminAuth(): UseAdminAuthReturn {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(() =>
    getStoredSession(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        const newSession = {
          isAuthenticated: true,
          adminId: user.uid,
        };
        setSession(newSession);
        setStoredSession(newSession);
      } else {
        setSession(null);
        setStoredSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAnonymously = async () => {
    if (!auth) {
      setError("Firebase não está inicializado");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      const newSession = {
        isAuthenticated: true,
        adminId: user.uid,
      };
      setSession(newSession);
      setStoredSession(newSession);
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string };
      const errorMessage = firebaseError.message || "Erro ao fazer login";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) {
      return;
    }

    try {
      await signOut(auth);
      setSession(null);
      setStoredSession(null);
      router.push("/");
    } catch {
      setError("Erro ao fazer logout");
    }
  };

  return {
    isAuthenticated: session?.isAuthenticated ?? false,
    adminId: session?.adminId ?? null,
    loading,
    loginAnonymously,
    logout,
    error,
  };
}
