"use client";

interface DrawnNumbersDisplayProps {
  drawnNumbers: number[];
}

export function DrawnNumbersDisplay({
  drawnNumbers,
}: DrawnNumbersDisplayProps) {
  const totalPossible = 100;
  const remaining = totalPossible - drawnNumbers.length;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Números Sorteados</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            {drawnNumbers.length} sorteados • {remaining} restantes
          </p>
        </div>
      </div>

      {drawnNumbers.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          Nenhum número sorteado ainda. Inicie o jogo e comece a sortear!
        </p>
      ) : (
        <div className="grid grid-cols-10 gap-2">
          {drawnNumbers.map((number) => (
            <div
              key={number}
              className="aspect-square flex items-center justify-center bg-blue-600 text-white font-bold rounded-lg text-sm"
            >
              {number}
            </div>
          ))}
        </div>
      )}

      {drawnNumbers.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Último número sorteado:</span>{" "}
            <span className="text-2xl font-bold text-blue-600 ml-2">
              {drawnNumbers[drawnNumbers.length - 1]}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
