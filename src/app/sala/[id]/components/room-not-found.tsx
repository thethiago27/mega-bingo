import { useRouter } from "next/navigation";

export function RoomNotFound() {
  const router = useRouter();

  function redirectToHome() {
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sala não encontrada
        </p>
        <button
          onClick={redirectToHome}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
