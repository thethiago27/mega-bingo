import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BingoHeader from "./bingo-header";
import { RoomStatus } from "@/lib/types";
import { useRouter } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("BingoHeader Component", () => {
  const mockPush = vi.fn();
  const mockUseRouter = vi.mocked(useRouter);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
  });

  it("should render the header with room ID", () => {
    render(<BingoHeader salaId="ABC123" status={RoomStatus.IN_PLAY} />);

    expect(screen.getByText("Sala #ABC123")).toBeInTheDocument();
  });

  it("should display the room status", () => {
    render(<BingoHeader salaId="ABC123" status={RoomStatus.IN_PLAY} />);

    expect(screen.getByText(RoomStatus.IN_PLAY)).toBeInTheDocument();
  });

  it("should display finished status", () => {
    render(<BingoHeader salaId="ABC123" status={RoomStatus.FINISHED} />);

    expect(screen.getByText(RoomStatus.FINISHED)).toBeInTheDocument();
  });

  it("should render back button with correct aria-label", () => {
    render(<BingoHeader salaId="ABC123" status={RoomStatus.IN_PLAY} />);

    const backButton = screen.getByLabelText("Voltar");
    expect(backButton).toBeInTheDocument();
  });

  it("should render exit button", () => {
    render(<BingoHeader salaId="ABC123" status={RoomStatus.IN_PLAY} />);

    const exitButton = screen.getByText("Sair");
    expect(exitButton).toBeInTheDocument();
  });

  it("should open back dialog when back button is clicked", () => {
    render(<BingoHeader salaId="ABC123" status={RoomStatus.IN_PLAY} />);

    const backButton = screen.getByLabelText("Voltar");
    fireEvent.click(backButton);

    expect(screen.getByText("Voltar para a tela inicial")).toBeInTheDocument();
    expect(
      screen.getByText("Deseja realmente voltar para a tela inicial?"),
    ).toBeInTheDocument();
  });

  it("should open exit dialog when exit button is clicked", () => {
    render(<BingoHeader salaId="ABC123" status={RoomStatus.IN_PLAY} />);

    const exitButton = screen.getByText("Sair");
    fireEvent.click(exitButton);

    expect(screen.getByText("Sair da sala")).toBeInTheDocument();
    expect(
      screen.getByText("Deseja realmente sair da sala?"),
    ).toBeInTheDocument();
  });

  it("should navigate to home when back is confirmed", () => {
    render(<BingoHeader salaId="ABC123" status={RoomStatus.IN_PLAY} />);

    // Open back dialog
    const backButton = screen.getByLabelText("Voltar");
    fireEvent.click(backButton);

    // Click confirm button in dialog
    const confirmButtons = screen.getAllByText("Voltar");
    const confirmButton = confirmButtons.find(
      (btn) => btn.tagName === "BUTTON",
    );
    fireEvent.click(confirmButton!);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should navigate to home when exit is confirmed", () => {
    render(<BingoHeader salaId="ABC123" status={RoomStatus.IN_PLAY} />);

    // Open exit dialog
    const exitButton = screen.getByText("Sair");
    fireEvent.click(exitButton);

    // Click confirm button in dialog
    const confirmButtons = screen.getAllByText("Sair");
    const confirmButton = confirmButtons.find(
      (btn) => btn.tagName === "BUTTON",
    );
    fireEvent.click(confirmButton!);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should have sticky positioning and backdrop blur", () => {
    const { container } = render(
      <BingoHeader salaId="ABC123" status={RoomStatus.IN_PLAY} />,
    );

    const header = container.querySelector("header");
    expect(header).toHaveClass("sticky", "top-0", "backdrop-blur-md");
  });

  it("should render with correct z-index for overlay", () => {
    const { container } = render(
      <BingoHeader salaId="ABC123" status={RoomStatus.IN_PLAY} />,
    );

    const header = container.querySelector("header");
    expect(header).toHaveClass("z-50");
  });

  it("should display room ID with different values", () => {
    const { rerender } = render(
      <BingoHeader salaId="ROOM1" status={RoomStatus.IN_PLAY} />,
    );
    expect(screen.getByText("Sala #ROOM1")).toBeInTheDocument();

    rerender(<BingoHeader salaId="ROOM2" status={RoomStatus.FINISHED} />);
    expect(screen.getByText("Sala #ROOM2")).toBeInTheDocument();
  });
});
