"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom } from "@/lib/database";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export function CreateRoomForm() {
  const router = useRouter();
  const { adminId } = useAdminAuth();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    if (!adminId) {
      setError("Admin ID não encontrado. Por favor, faça login novamente.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // Usa o sistema antigo de salas que já funciona com jogadores
      const roomId = await createRoom("Sala do Admin");
      router.push(`/admin/room/${roomId}`);
    } catch (err) {
      setError("Erro ao criar sala. Por favor, tente novamente.");
      setCreating(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Criar Nova Sala de Bingo
      </h2>
      <p className="text-gray-600 mb-6">
        Clique no botão abaixo para criar uma nova sala. Um código único será
        gerado automaticamente e você será redirecionado para a página de
        gerenciamento da sala.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleCreateRoom}
          disabled={creating}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
        >
          {creating ? "Criando sala..." : "Criar Sala"}
        </button>
        <button
          onClick={() => router.back()}
          disabled={creating}
          className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
        >
          Cancelar
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Como funciona?</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>A sala será criada com um código único</li>
          <li>Compartilhe o código com os jogadores</li>
          <li>Os jogadores podem entrar usando o código</li>
          <li>Você poderá sortear números quando estiver pronto</li>
        </ul>
      </div>
    </div>
  );
}
