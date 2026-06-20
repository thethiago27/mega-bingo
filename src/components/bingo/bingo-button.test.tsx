import { fireEvent, render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as useRoomHook from '@/hooks/use-room';
import BingoButton from './bingo-button';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  onValue: vi.fn(),
  off: vi.fn(),
  push: vi.fn(),
  set: vi.fn(),
}));

// Mock dependencies
vi.mock('@/hooks/use-room');
vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

describe('BingoButton Component', () => {
  const mockUseRoom = vi.mocked(useRoomHook.useRoom);
  const mockUseParams = vi.mocked(useParams);
  const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'test-room-123' });
  });

  it('should render the BINGO button', () => {
    mockUseRoom.mockReturnValue({
      room: null,
      playerId: null,
      cardNumbers: [1, 5, 10, 15, 20],
      markedNumbers: [],
      drawnNumbers: [],
      loading: false,
      error: null,
      isBingo: false,
      totalNumbers: 20,
      currentNumber: null,
      handleMarkNumber: vi.fn(),
    });

    render(<BingoButton />);

    expect(screen.getByText('BINGO!')).toBeInTheDocument();
  });

  it('should be disabled when bingo is not complete', () => {
    mockUseRoom.mockReturnValue({
      room: null,
      playerId: null,
      cardNumbers: [1, 5, 10, 15, 20],
      markedNumbers: [1, 5],
      drawnNumbers: [1, 5],
      loading: false,
      error: null,
      isBingo: false,
      totalNumbers: 20,
      currentNumber: 5,
      handleMarkNumber: vi.fn(),
    });

    render(<BingoButton />);

    const button = screen.getByRole('button', { name: /BINGO!/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('bg-gray-300', 'cursor-not-allowed');
  });

  it('should show lock icon when disabled', () => {
    mockUseRoom.mockReturnValue({
      room: null,
      playerId: null,
      cardNumbers: [1, 5, 10, 15, 20],
      markedNumbers: [1],
      drawnNumbers: [1],
      loading: false,
      error: null,
      isBingo: false,
      totalNumbers: 20,
      currentNumber: 1,
      handleMarkNumber: vi.fn(),
    });

    render(<BingoButton />);

    const lockIcon = screen.getByRole('button').querySelector('svg');
    expect(lockIcon).toBeInTheDocument();
  });

  it('should be enabled when all numbers are marked', () => {
    mockUseRoom.mockReturnValue({
      room: null,
      playerId: null,
      cardNumbers: [1, 5, 10, 15, 20],
      markedNumbers: [1, 5, 10, 15, 20],
      drawnNumbers: [1, 5, 10, 15, 20],
      loading: false,
      error: null,
      isBingo: true,
      totalNumbers: 20,
      currentNumber: 20,
      handleMarkNumber: vi.fn(),
    });

    render(<BingoButton />);

    const button = screen.getByRole('button', { name: /BINGO!/i });
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('bg-green-500');
  });

  it('should not show lock icon when enabled', () => {
    mockUseRoom.mockReturnValue({
      room: null,
      playerId: null,
      cardNumbers: [1, 5, 10],
      markedNumbers: [1, 5, 10],
      drawnNumbers: [1, 5, 10],
      loading: false,
      error: null,
      isBingo: true,
      totalNumbers: 10,
      currentNumber: 10,
      handleMarkNumber: vi.fn(),
    });

    render(<BingoButton />);

    const lockIcon = screen.getByRole('button').querySelector('svg');
    expect(lockIcon).not.toBeInTheDocument();
  });

  it('should show alert when clicked with complete bingo', () => {
    mockUseRoom.mockReturnValue({
      room: null,
      playerId: null,
      cardNumbers: [1, 5, 10],
      markedNumbers: [1, 5, 10],
      drawnNumbers: [1, 5, 10],
      loading: false,
      error: null,
      isBingo: true,
      totalNumbers: 10,
      currentNumber: 10,
      handleMarkNumber: vi.fn(),
    });

    render(<BingoButton />);

    const button = screen.getByRole('button', { name: /BINGO!/i });
    fireEvent.click(button);

    expect(mockAlert).toHaveBeenCalledWith('🎉 BINGO! Você ganhou!');
  });

  it('should not trigger alert when clicked while disabled', () => {
    mockUseRoom.mockReturnValue({
      room: null,
      playerId: null,
      cardNumbers: [1, 5, 10],
      markedNumbers: [1, 5],
      drawnNumbers: [1, 5],
      loading: false,
      error: null,
      isBingo: false,
      totalNumbers: 10,
      currentNumber: 5,
      handleMarkNumber: vi.fn(),
    });

    render(<BingoButton />);

    const button = screen.getByRole('button', { name: /BINGO!/i });
    fireEvent.click(button);

    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('should be disabled when cartela is empty', () => {
    mockUseRoom.mockReturnValue({
      room: null,
      playerId: null,
      cardNumbers: [],
      markedNumbers: [],
      drawnNumbers: [],
      loading: false,
      error: null,
      isBingo: false,
      totalNumbers: 0,
      currentNumber: null,
      handleMarkNumber: vi.fn(),
    });

    render(<BingoButton />);

    const button = screen.getByRole('button', { name: /BINGO!/i });
    expect(button).toBeDisabled();
  });

  it('should use room ID from params', () => {
    mockUseParams.mockReturnValue({ id: 'sala-456' });
    mockUseRoom.mockReturnValue({
      room: null,
      playerId: null,
      cardNumbers: [1, 5, 10],
      markedNumbers: [],
      drawnNumbers: [],
      loading: false,
      error: null,
      isBingo: false,
      totalNumbers: 10,
      currentNumber: null,
      handleMarkNumber: vi.fn(),
    });

    render(<BingoButton />);

    expect(mockUseRoom).toHaveBeenCalledWith('sala-456');
  });
});
