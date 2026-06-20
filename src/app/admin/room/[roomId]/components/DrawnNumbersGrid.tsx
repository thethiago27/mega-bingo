import { memo } from 'react';

interface DrawnNumbersGridProps {
  drawnNumbers: number[];
}

export const DrawnNumbersGrid = memo(function DrawnNumbersGrid({
  drawnNumbers,
}: DrawnNumbersGridProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Números Sorteados ({drawnNumbers.length})
      </h3>

      {drawnNumbers.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          Nenhum número sorteado ainda. Clique em &quot;Sortear Número&quot;
          para começar.
        </p>
      ) : (
        <div className="grid grid-cols-10 gap-2">
          {drawnNumbers.map((number, index) => (
            <div
              key={index}
              className="aspect-square flex items-center justify-center bg-blue-100 text-blue-900 rounded font-semibold text-sm"
            >
              {number}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
