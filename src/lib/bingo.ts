export function gerarCartela(): number[] {
  const numeros = new Set<number>();

  while (numeros.size < 10) {
    const numero = Math.floor(Math.random() * 60) + 1;
    numeros.add(numero);
  }

  return Array.from(numeros).sort((a, b) => a - b);
}

export function verificarBingo(
  cartela: number[],
  numerosSorteados: number[]
): boolean {
  return cartela.every((num) => numerosSorteados.includes(num));
}
