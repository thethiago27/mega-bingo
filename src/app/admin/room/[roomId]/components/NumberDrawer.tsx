import { memo } from "react";

interface NumberDrawerProps {
  currentNumber: number | null;
  drawing: boolean;
  numerosSorteados: number[];
  onDrawNumber: () => void;
  disabled?: boolean;
}

export const NumberDrawer = memo(function NumberDrawer({
  currentNumber,
  drawing,
  numerosSorteados,
  onDrawNumber,
  disabled = false,
}: NumberDrawerProps) {
  const isDisabled = drawing || numerosSorteados.length >= 100 || disabled;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sortear Número
      </h3>

      {currentNumber && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600 text-white rounded-full text-4xl font-bold">
            {currentNumber}
          </div>
          <p className="text-sm text-gray-600 mt-2">Último número</p>
        </div>
      )}

      <button
        onClick={onDrawNumber}
        disabled={isDisabled}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {drawing ? "Sorteando..." : "Sortear Número"}
      </button>

      {disabled && (
        <p className="text-sm text-yellow-600 mt-2 text-center">
          Inicie uma nova rodada para continuar sorteando
        </p>
      )}

      {numerosSorteados.length >= 100 && !disabled && (
        <p className="text-sm text-gray-600 mt-2 text-center">
          Todos os números foram sorteados
        </p>
      )}
    </div>
  );
});
