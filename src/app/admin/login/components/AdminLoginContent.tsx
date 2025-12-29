"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export function AdminLoginContent() {
  const router = useRouter();
  const { loginAnonymously, loading, error, isAuthenticated } = useAdminAuth();

  const handleRetry = useCallback(() => {
    loginAnonymously();
  }, [loginAnonymously]);

  const handleGoHome = useCallback(() => {
    router.push("/");
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin");
      return;
    }

    const doLogin = async () => {
      try {
        await loginAnonymously();
        router.push("/admin");
      } catch {
        // Error is handled by the hook
      }
    };

    doLogin();
  }, [loginAnonymously, router, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Mega Bingo</h1>
        <p className="text-gray-600 mb-8">Painel Administrativo</p>

        {loading && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600">Entrando...</p>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Tentar novamente
            </button>
            <div>
              <button
                onClick={handleGoHome}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Voltar para página inicial
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
