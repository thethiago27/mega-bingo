import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as useRoomModule from '@/hooks/use-room';

// Mock Firebase before any imports
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

vi.mock('@/hooks/use-room');

import HistoryStrip from './history-strip';

const createMockUseRoomReturn = (
  overrides: Partial<ReturnType<typeof useRoomModule.useRoom>> = {}
): ReturnType<typeof useRoomModule.useRoom> => ({
  sala: null,
  jogadorId: null,
  cartela: [],
  numerosMarcados: [],
  numerosSorteados: [],
  loading: false,
  error: null,
  isBingo: false,
  totalNumeros: 0,
  currentNumber: null,
  handleMarkNumber: vi.fn(),
  ...overrides,
});

describe('HistoryStrip Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors when no numbers are drawn', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [],
        currentNumber: null,
      })
    );

    const { container } = render(<HistoryStrip roomId="test-room" />);

    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('should display the last 4 drawn numbers', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [10, 25, 42, 67, 89],
        currentNumber: 89,
      })
    );

    render(<HistoryStrip roomId="test-room" />);

    // Should show last 4: 25, 42, 67, 89
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('67')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();

    // Should not show the first number (10)
    expect(screen.queryByText('10')).not.toBeInTheDocument();
  });

  it('should display numbers with zero padding', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [1, 5, 9],
        currentNumber: 9,
      })
    );

    render(<HistoryStrip roomId="test-room" />);

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('05')).toBeInTheDocument();
    expect(screen.getByText('09')).toBeInTheDocument();
  });

  it('should highlight the current number with special styling', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [10, 25, 42],
        currentNumber: 42,
      })
    );

    render(<HistoryStrip roomId="test-room" />);

    const currentNumberElement = screen.getByText('42').closest('div');
    expect(currentNumberElement).toHaveClass('bg-blue-500', 'text-white');
  });

  it('should display order numbers for each drawn number', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [10, 25, 42],
        currentNumber: 42,
      })
    );

    render(<HistoryStrip roomId="test-room" />);

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('should apply different opacity to non-current numbers', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [10, 25, 42, 67],
        currentNumber: 67,
      })
    );

    const { container } = render(<HistoryStrip roomId="test-room" />);

    const numberContainers = container.querySelectorAll(
      '.flex.flex-col.items-center.gap-1'
    );

    // Current number (67) should have opacity 1
    expect(numberContainers[3]).toHaveStyle({ opacity: 1 });

    // Second to last (42) should have opacity 0.9
    expect(numberContainers[2]).toHaveStyle({ opacity: 0.9 });

    // Older numbers should have opacity 0.7
    expect(numberContainers[0]).toHaveStyle({ opacity: 0.7 });
    expect(numberContainers[1]).toHaveStyle({ opacity: 0.7 });
  });

  it('should render separators between numbers', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [10, 25, 42],
        currentNumber: 42,
      })
    );

    const { container } = render(<HistoryStrip roomId="test-room" />);

    const separators = container.querySelectorAll('.w-4.h-\\[2px\\]');
    // Should have 2 separators for 3 numbers
    expect(separators).toHaveLength(2);
  });

  it('should not render separator after the last number', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [10, 25],
        currentNumber: 25,
      })
    );

    const { container } = render(<HistoryStrip roomId="test-room" />);

    const separators = container.querySelectorAll('.w-4.h-\\[2px\\]');
    // Should have 1 separator for 2 numbers
    expect(separators).toHaveLength(1);
  });

  it('should handle single drawn number', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [42],
        currentNumber: 42,
      })
    );

    const { container } = render(<HistoryStrip roomId="test-room" />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();

    const separators = container.querySelectorAll('.w-4.h-\\[2px\\]');
    expect(separators).toHaveLength(0);
  });

  it('should handle exactly 4 drawn numbers', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [10, 25, 42, 67],
        currentNumber: 67,
      })
    );

    render(<HistoryStrip roomId="test-room" />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('67')).toBeInTheDocument();
  });

  it('should handle more than 4 drawn numbers and show only last 4', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        currentNumber: 10,
      })
    );

    render(<HistoryStrip roomId="test-room" />);

    // Should show last 4: 7, 8, 9, 10
    expect(screen.getByText('07')).toBeInTheDocument();
    expect(screen.getByText('08')).toBeInTheDocument();
    expect(screen.getByText('09')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    // Should not show earlier numbers
    expect(screen.queryByText('01')).not.toBeInTheDocument();
    expect(screen.queryByText('06')).not.toBeInTheDocument();
  });

  it('should display correct order numbers for last 4 of many drawn numbers', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [1, 2, 3, 4, 5, 6, 7, 8],
        currentNumber: 8,
      })
    );

    render(<HistoryStrip roomId="test-room" />);

    // Last 4 numbers are 5, 6, 7, 8 with orders #5, #6, #7, #8
    expect(screen.getByText('#5')).toBeInTheDocument();
    expect(screen.getByText('#6')).toBeInTheDocument();
    expect(screen.getByText('#7')).toBeInTheDocument();
    expect(screen.getByText('#8')).toBeInTheDocument();
  });

  it('should apply blue color to current number order badge', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [10, 25, 42],
        currentNumber: 42,
      })
    );

    render(<HistoryStrip roomId="test-room" />);

    const currentOrderBadge = screen.getByText('#3');
    expect(currentOrderBadge).toHaveClass('text-blue-500');
  });

  it('should apply gray color to non-current number order badges', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [10, 25, 42],
        currentNumber: 42,
      })
    );

    render(<HistoryStrip roomId="test-room" />);

    const oldOrderBadge1 = screen.getByText('#1');
    const oldOrderBadge2 = screen.getByText('#2');

    expect(oldOrderBadge1).toHaveClass('text-gray-400');
    expect(oldOrderBadge2).toHaveClass('text-gray-400');
  });

  it('should pass correct roomId to useRoom hook', () => {
    const mockUseRoom = vi.spyOn(useRoomModule, 'useRoom');
    mockUseRoom.mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [],
        currentNumber: null,
      })
    );

    render(<HistoryStrip roomId="custom-room-789" />);

    expect(mockUseRoom).toHaveBeenCalledWith('custom-room-789');
  });

  it('should handle transition from no numbers to having numbers', () => {
    const mockUseRoom = vi.spyOn(useRoomModule, 'useRoom');

    mockUseRoom.mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [],
        currentNumber: null,
      })
    );

    const { rerender } = render(<HistoryStrip roomId="test-room" />);
    expect(screen.queryByText('42')).not.toBeInTheDocument();

    mockUseRoom.mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [42],
        currentNumber: 42,
      })
    );

    rerender(<HistoryStrip roomId="test-room" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render with correct section styling classes', () => {
    vi.spyOn(useRoomModule, 'useRoom').mockReturnValue(
      createMockUseRoomReturn({
        numerosSorteados: [10],
        currentNumber: 10,
      })
    );

    const { container } = render(<HistoryStrip roomId="test-room" />);

    const section = container.querySelector('section');
    expect(section).toHaveClass(
      'w-full',
      'border-y',
      'bg-white',
      'py-3',
      'overflow-hidden'
    );
  });
});
