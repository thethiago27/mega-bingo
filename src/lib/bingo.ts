/** Highest number that can be drawn (numbers range from 1 to MAX_NUMBER). */
export const MAX_NUMBER = 60;

/** How many numbers each player's card holds. */
export const CARD_SIZE = 10;

export function generateCard(): number[] {
  const numbers = new Set<number>();

  while (numbers.size < CARD_SIZE) {
    const number = Math.floor(Math.random() * MAX_NUMBER) + 1;
    numbers.add(number);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

export function checkBingo(
  cardNumbers: number[],
  drawnNumbers: number[]
): boolean {
  return cardNumbers.every((num) => drawnNumbers.includes(num));
}
