import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">🎉 Mega Bingo</h1>
        <p className="text-xl text-gray-600 mb-12">
          O jogo de bingo online mais emocionante!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Player Card */}
          <Link
            href="/entrar"
            className="block p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Jogar</h2>
            <p className="text-gray-600">
              Entre em uma sala com seu código e comece a jogar bingo!
            </p>
          </Link>

          {/* Admin Card */}
          <Link
            href="/admin/login"
            className="block p-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin</h2>
            <p className="text-blue-100">
              Gerencie salas, sorteie números e controle o jogo.
            </p>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Como funciona?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <div className="text-2xl mb-2">1️⃣</div>
              <p>Admin cria uma sala e compartilha o código</p>
            </div>
            <div>
              <div className="text-2xl mb-2">2️⃣</div>
              <p>Jogadores entram com o código e recebem cartelas</p>
            </div>
            <div>
              <div className="text-2xl mb-2">3️⃣</div>
              <p>Admin sorteia números e o primeiro a completar ganha!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
