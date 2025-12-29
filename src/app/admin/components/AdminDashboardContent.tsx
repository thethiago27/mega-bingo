'use client';

import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useEffect, useState } from 'react';
import { Sala } from '@/lib/types';
import Link from 'next/link';
import { loadSalas } from '@/lib/firebase-utils';

export function AdminDashboardContent() {
  const { adminId } = useAdminAuth();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalas = async () => {
      try {
        const salasData = await loadSalas();
        setSalas(salasData);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchSalas();
  }, []);

  const salasAtivas = salas.filter((sala) => sala.ativa);
  const salasFinalizadas = salas.filter((sala) => !sala.ativa);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Bem-vindo ao Painel de Administração
        </h2>
        <p className="text-gray-600 mb-6">
          Gerencie suas salas de bingo e controle os jogos em tempo real.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/create-room"
            className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Criar Nova Sala
            </h3>
            <p className="text-blue-700">
              Crie uma nova sala de bingo e comece um novo jogo.
            </p>
          </Link>

          <div className="block p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Salas Ativas
            </h3>
            <p className="text-green-700 text-2xl font-bold">
              {loading ? '...' : salasAtivas.length}
            </p>
          </div>
        </div>
      </div>

      {/* Active Rooms */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Salas Ativas
        </h3>
        {loading ? (
          <p className="text-gray-600">Carregando...</p>
        ) : salasAtivas.length === 0 ? (
          <p className="text-gray-600">
            Nenhuma sala ativa. Crie uma nova sala para começar.
          </p>
        ) : (
          <div className="space-y-3">
            {salasAtivas.map((sala) => (
              <Link
                key={sala.id}
                href={`/admin/room/${sala.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Sala {sala.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {sala.numerosSorteados?.length || 0} número(s) sorteado(s)
                    </p>
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ativa
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Completed Rooms */}
      {salasFinalizadas.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Histórico de Salas Finalizadas
          </h3>
          <div className="space-y-3">
            {salasFinalizadas.slice(0, 5).map((sala) => (
              <Link
                key={sala.id}
                href={`/admin/room/${sala.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Sala {sala.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {sala.numerosSorteados?.length || 0} número(s) sorteado(s)
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Finalizada
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informações da Conta
        </h3>
        <p className="text-gray-600">
          ID do Administrador:{' '}
          <span className="font-mono font-semibold text-sm">{adminId}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Você está usando autenticação anônima. Seu ID é único para esta
          sessão.
        </p>
      </div>
    </div>
  );
}
