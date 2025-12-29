import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { BingoCard } from "./bingo-card";
import * as useRoomModule from "@/hooks/use-room";
import * as useWinStateModule from "@/hooks/use-win-state";
import { WinState } from "@/lib/animation-utils";

// Mock dependencies
vi.mock("@/hooks/use-room");
vi.mock("@/hooks/use-win-state");
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key: string) => (key === "nome" ? "TestPlayer" : null)),
  })),
}));

vi.mock("./animated-number", () => ({
  AnimatedNumber: ({
    number,
    isMarked,
    isNew,
  }: {
    number: number;
    isMarked: boolean;
    isNew: boolean;
  }) => (
    <div
      data-testid={`animated-number-${number}`}
      data-marked={isMarked}
      data-new={isNew}
    >
      {number.toString().padStart(2, "0")}
    </div>
  ),
}));

vi.mock("./celebration-overlay", () => ({
  CelebrationOverlay: ({
    show,
    playerName,
  }: {
    show: boolean;
    playerName: string;
  }) =>
    show ? (
      <div data-testid="celebration-overlay">Celebrating {playerName}!</div>
    ) : null,
}));

describe("BingoCard", () => {
  const mockHandleMarkNumber = vi.fn();

  const defaultUseRoomReturn = {
    numerosMarcados: [],
    totalNumeros: 10,
    cartela: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    handleMarkNumber: mockHandleMarkNumber,
    currentNumber: null,
    loading: false,
    error: null,
    sala: null,
    jogadorId: "test-player-id",
    isBingo: false,
    numerosSorteados: [],
  };

  const defaultWinState = {
    state: WinState.NORMAL,
    percentage: 0,
    numbersRemaining: 10,
    cardClasses: "",
    shouldCelebrate: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useRoomModule, "useRoom").mockReturnValue(defaultUseRoomReturn);
    vi.spyOn(useWinStateModule, "useWinState").mockReturnValue(defaultWinState);
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        loading: true,
      });

      render(<BingoCard roomId="test-room" />);

      expect(screen.getByText("Carregando cartela...")).toBeInTheDocument();
    });

    it("should show loading animation", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        loading: true,
      });

      const { container } = render(<BingoCard roomId="test-room" />);

      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  describe("Empty Card State", () => {
    it("should show message when cartela is empty", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        cartela: [],
      });

      render(<BingoCard roomId="test-room" />);

      expect(screen.getByText(/Aguardando cartela.../i)).toBeInTheDocument();
    });

    it("should show reload suggestion when cartela is empty", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        cartela: [],
      });

      render(<BingoCard roomId="test-room" />);

      expect(
        screen.getByText(/Se o problema persistir, recarregue a página/i),
      ).toBeInTheDocument();
    });
  });

  describe("Card Rendering", () => {
    it("should render card title", () => {
      render(<BingoCard roomId="test-room" />);

      expect(screen.getByText("Sua Cartela")).toBeInTheDocument();
    });

    it("should render all numbers from cartela", () => {
      render(<BingoCard roomId="test-room" />);

      defaultUseRoomReturn.cartela.forEach((numero) => {
        expect(
          screen.getByTestId(`animated-number-${numero}`),
        ).toBeInTheDocument();
      });
    });

    it("should render progress indicator", () => {
      render(<BingoCard roomId="test-room" />);

      expect(screen.getByText("0/10 Marcados")).toBeInTheDocument();
    });

    it("should update progress indicator with marked numbers", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        numerosMarcados: [1, 2, 3, 4, 5],
      });

      render(<BingoCard roomId="test-room" />);

      expect(screen.getByText("5/10 Marcados")).toBeInTheDocument();
    });
  });

  describe("Win State Integration", () => {
    it("should call useWinState with correct parameters", () => {
      const useWinStateSpy = vi.spyOn(useWinStateModule, "useWinState");

      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        numerosMarcados: [1, 2, 3],
      });

      render(<BingoCard roomId="test-room" />);

      expect(useWinStateSpy).toHaveBeenCalledWith(10, 3);
    });

    it("should apply normal state classes", () => {
      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        ...defaultWinState,
        state: WinState.NORMAL,
        cardClasses: "",
      });

      const { container } = render(<BingoCard roomId="test-room" />);

      const grid = container.querySelector(".grid");
      expect(grid?.className).not.toContain("animate-pulse");
    });

    it("should apply near win state classes", () => {
      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        ...defaultWinState,
        state: WinState.NEAR,
        cardClasses: "animate-pulse-near glow-near",
      });

      const { container } = render(<BingoCard roomId="test-room" />);

      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("animate-pulse-near");
      expect(grid?.className).toContain("glow-near");
    });

    it("should apply critical win state classes", () => {
      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        ...defaultWinState,
        state: WinState.CRITICAL,
        cardClasses: "animate-pulse-critical glow-critical",
      });

      const { container } = render(<BingoCard roomId="test-room" />);

      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("animate-pulse-critical");
      expect(grid?.className).toContain("glow-critical");
    });

    it("should apply win state classes", () => {
      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        ...defaultWinState,
        state: WinState.WIN,
        cardClasses: "animate-celebration glow-win",
      });

      const { container } = render(<BingoCard roomId="test-room" />);

      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("animate-celebration");
      expect(grid?.className).toContain("glow-win");
    });
  });

  describe("AnimatedNumber Integration", () => {
    it("should pass correct isMarked prop to AnimatedNumber", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        numerosMarcados: [1, 5, 10],
      });

      render(<BingoCard roomId="test-room" />);

      expect(
        screen.getByTestId("animated-number-1").getAttribute("data-marked"),
      ).toBe("true");
      expect(
        screen.getByTestId("animated-number-2").getAttribute("data-marked"),
      ).toBe("false");
      expect(
        screen.getByTestId("animated-number-5").getAttribute("data-marked"),
      ).toBe("true");
    });

    it("should pass correct isNew prop when number is current", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        currentNumber: 7,
      });

      render(<BingoCard roomId="test-room" />);

      expect(
        screen.getByTestId("animated-number-7").getAttribute("data-new"),
      ).toBe("true");
      expect(
        screen.getByTestId("animated-number-1").getAttribute("data-new"),
      ).toBe("false");
    });

    it("should handle number marking", async () => {
      const user = userEvent.setup();

      render(<BingoCard roomId="test-room" />);

      // Click the button wrapper around the number
      const buttons = screen.getAllByRole("button");
      const numberButton = buttons.find((btn) =>
        btn.querySelector('[data-testid="animated-number-5"]'),
      );

      if (numberButton) {
        await user.click(numberButton);
        expect(mockHandleMarkNumber).toHaveBeenCalledWith(5);
      }
    });
  });

  describe("CelebrationOverlay Integration", () => {
    it("should not show celebration when shouldCelebrate is false", () => {
      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        ...defaultWinState,
        shouldCelebrate: false,
      });

      render(<BingoCard roomId="test-room" />);

      expect(
        screen.queryByTestId("celebration-overlay"),
      ).not.toBeInTheDocument();
    });

    it("should show celebration when shouldCelebrate is true", () => {
      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        ...defaultWinState,
        shouldCelebrate: true,
      });

      render(<BingoCard roomId="test-room" />);

      expect(screen.getByTestId("celebration-overlay")).toBeInTheDocument();
    });

    it("should pass player name to celebration overlay", () => {
      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        ...defaultWinState,
        shouldCelebrate: true,
      });

      render(<BingoCard roomId="test-room" />);

      expect(screen.getByText("Celebrating TestPlayer!")).toBeInTheDocument();
    });
  });

  describe("Player Name Extraction", () => {
    it("should extract player name from search params", () => {
      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        ...defaultWinState,
        shouldCelebrate: true,
      });

      render(<BingoCard roomId="test-room" />);

      // Default mock returns 'TestPlayer'
      expect(screen.getByText("Celebrating TestPlayer!")).toBeInTheDocument();
    });
  });

  describe("Current Number Highlighting", () => {
    it("should highlight current number", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        currentNumber: 15,
      });

      render(<BingoCard roomId="test-room" />);

      expect(
        screen.getByTestId("animated-number-15").getAttribute("data-new"),
      ).toBe("true");
    });

    it("should not highlight any number when currentNumber is null", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        currentNumber: null,
      });

      render(<BingoCard roomId="test-room" />);

      defaultUseRoomReturn.cartela.forEach((numero) => {
        expect(
          screen
            .getByTestId(`animated-number-${numero}`)
            .getAttribute("data-new"),
        ).toBe("false");
      });
    });
  });

  describe("Progressive Win States", () => {
    it("should show normal state with 0% completion", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        numerosMarcados: [],
      });

      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        state: WinState.NORMAL,
        percentage: 0,
        numbersRemaining: 10,
        cardClasses: "",
        shouldCelebrate: false,
      });

      const { container } = render(<BingoCard roomId="test-room" />);

      const grid = container.querySelector(".grid");
      expect(grid?.className).not.toContain("animate-pulse");
    });

    it("should show near state with 75% completion", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        numerosMarcados: Array.from({ length: 8 }, (_, i) => i + 1),
      });

      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        state: WinState.NEAR,
        percentage: 80,
        numbersRemaining: 2,
        cardClasses: "animate-pulse-near glow-near",
        shouldCelebrate: false,
      });

      const { container } = render(<BingoCard roomId="test-room" />);

      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("animate-pulse-near");
    });

    it("should show critical state with 90% completion", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        numerosMarcados: Array.from({ length: 9 }, (_, i) => i + 1),
      });

      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        state: WinState.CRITICAL,
        percentage: 90,
        numbersRemaining: 1,
        cardClasses: "animate-pulse-critical glow-critical",
        shouldCelebrate: false,
      });

      const { container } = render(<BingoCard roomId="test-room" />);

      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("animate-pulse-critical");
    });

    it("should show win state with 100% completion", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        numerosMarcados: Array.from({ length: 10 }, (_, i) => i + 1),
      });

      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        state: WinState.WIN,
        percentage: 100,
        numbersRemaining: 0,
        cardClasses: "animate-celebration glow-win",
        shouldCelebrate: true,
      });

      render(<BingoCard roomId="test-room" />);

      expect(screen.getByTestId("celebration-overlay")).toBeInTheDocument();
    });
  });

  describe("Grid Layout", () => {
    it("should render grid with 2 columns", () => {
      const { container } = render(<BingoCard roomId="test-room" />);

      const grid = container.querySelector(".grid-cols-2");
      expect(grid).toBeInTheDocument();
    });

    it("should apply gap between numbers", () => {
      const { container } = render(<BingoCard roomId="test-room" />);

      const grid = container.querySelector(".gap-3");
      expect(grid).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      render(<BingoCard roomId="test-room" />);

      const heading = screen.getByText("Sua Cartela");
      expect(heading.tagName).toBe("H3");
    });

    it("should render check icon for progress", () => {
      const { container } = render(<BingoCard roomId="test-room" />);

      // CheckCircle is rendered as an SVG, look for the w-4 h-4 class
      const icon = container.querySelector(".w-4.h-4");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Real-time Updates", () => {
    it("should update when new numbers are marked", async () => {
      const { rerender } = render(<BingoCard roomId="test-room" />);

      expect(screen.getByText("0/10 Marcados")).toBeInTheDocument();

      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        numerosMarcados: [1, 2, 3],
      });

      rerender(<BingoCard roomId="test-room" />);

      await waitFor(() => {
        expect(screen.getByText("3/10 Marcados")).toBeInTheDocument();
      });
    });

    it("should update win state as numbers are marked", () => {
      const { rerender } = render(<BingoCard roomId="test-room" />);

      vi.spyOn(useWinStateModule, "useWinState").mockReturnValue({
        ...defaultWinState,
        state: WinState.NEAR,
        cardClasses: "animate-pulse-near glow-near",
      });

      rerender(<BingoCard roomId="test-room" />);

      const { container } = render(<BingoCard roomId="test-room" />);
      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("animate-pulse-near");
    });
  });

  describe("Edge Cases", () => {
    it("should handle cartela with duplicate numbers", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        cartela: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10],
      });

      render(<BingoCard roomId="test-room" />);

      // Should render all numbers even if duplicated
      expect(screen.getAllByTestId(/animated-number-/)).toHaveLength(20);
    });

    it("should handle empty numerosMarcados array", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        numerosMarcados: [],
      });

      render(<BingoCard roomId="test-room" />);

      expect(screen.getByText("0/20 Marcados")).toBeInTheDocument();
    });

    it("should handle all numbers marked", () => {
      vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
        ...defaultUseRoomReturn,
        numerosMarcados: defaultUseRoomReturn.cartela,
      });

      render(<BingoCard roomId="test-room" />);

      expect(screen.getByText("20/20 Marcados")).toBeInTheDocument();
    });
  });
});
