import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CurrentNumber from "./current-number";
import * as useRoomModule from "@/hooks/use-room";

vi.mock("@/hooks/use-room");

describe("CurrentNumber Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the section title", () => {
    vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
      currentNumber: null,
    } as ReturnType<typeof useRoomModule.useRoom>);

    render(<CurrentNumber roomId="test-room" />);

    expect(screen.getByText("Número Sorteado")).toBeInTheDocument();
  });

  it('should display "--" when no number is provided', () => {
    vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
      currentNumber: null,
    } as ReturnType<typeof useRoomModule.useRoom>);

    render(<CurrentNumber roomId="test-room" />);

    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("should display the current number when provided", () => {
    vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
      currentNumber: 42,
    } as ReturnType<typeof useRoomModule.useRoom>);

    render(<CurrentNumber roomId="test-room" />);

    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it('should display "AGORA" badge when a number is present', () => {
    vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
      currentNumber: 75,
    } as ReturnType<typeof useRoomModule.useRoom>);

    render(<CurrentNumber roomId="test-room" />);

    expect(screen.getByText("AGORA")).toBeInTheDocument();
  });

  it('should not display "AGORA" badge when no number is present', () => {
    vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
      currentNumber: null,
    } as ReturnType<typeof useRoomModule.useRoom>);

    render(<CurrentNumber roomId="test-room" />);

    expect(screen.queryByText("AGORA")).not.toBeInTheDocument();
  });

  it("should display countdown timer when proximoEm is provided", () => {
    vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
      currentNumber: 42,
    } as ReturnType<typeof useRoomModule.useRoom>);

    render(<CurrentNumber roomId="test-room" proximoEm={5} />);

    expect(screen.getByText("Sorteando próximo em 5s...")).toBeInTheDocument();
  });

  it("should not display countdown timer when proximoEm is not provided", () => {
    vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
      currentNumber: 42,
    } as ReturnType<typeof useRoomModule.useRoom>);

    render(<CurrentNumber roomId="test-room" />);

    expect(screen.queryByText(/Sorteando próximo em/)).not.toBeInTheDocument();
  });

  it("should display different countdown values", () => {
    vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
      currentNumber: 10,
    } as ReturnType<typeof useRoomModule.useRoom>);

    const { rerender } = render(
      <CurrentNumber roomId="test-room" proximoEm={10} />,
    );
    expect(screen.getByText("Sorteando próximo em 10s...")).toBeInTheDocument();

    rerender(<CurrentNumber roomId="test-room" proximoEm={3} />);
    expect(screen.getByText("Sorteando próximo em 3s...")).toBeInTheDocument();
  });

  it("should render with correct styling classes", () => {
    vi.spyOn(useRoomModule, "useRoom").mockReturnValue({
      currentNumber: 25,
    } as ReturnType<typeof useRoomModule.useRoom>);

    const { container } = render(<CurrentNumber roomId="test-room" />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("flex", "flex-col", "items-center");
  });

  it("should display different numbers correctly", () => {
    const mockUseRoom = vi.spyOn(useRoomModule, "useRoom");

    mockUseRoom.mockReturnValue({
      currentNumber: 1,
    } as ReturnType<typeof useRoomModule.useRoom>);
    const { rerender } = render(<CurrentNumber roomId="test-room" />);
    expect(screen.getByText("1")).toBeInTheDocument();

    mockUseRoom.mockReturnValue({
      currentNumber: 100,
    } as ReturnType<typeof useRoomModule.useRoom>);
    rerender(<CurrentNumber roomId="test-room" />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("should handle transition from null to number", () => {
    const mockUseRoom = vi.spyOn(useRoomModule, "useRoom");

    mockUseRoom.mockReturnValue({
      currentNumber: null,
    } as ReturnType<typeof useRoomModule.useRoom>);
    const { rerender } = render(<CurrentNumber roomId="test-room" />);
    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.queryByText("AGORA")).not.toBeInTheDocument();

    mockUseRoom.mockReturnValue({
      currentNumber: 50,
    } as ReturnType<typeof useRoomModule.useRoom>);
    rerender(<CurrentNumber roomId="test-room" />);
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("AGORA")).toBeInTheDocument();
  });

  it("should handle transition from number to null", () => {
    const mockUseRoom = vi.spyOn(useRoomModule, "useRoom");

    mockUseRoom.mockReturnValue({
      currentNumber: 50,
    } as ReturnType<typeof useRoomModule.useRoom>);
    const { rerender } = render(<CurrentNumber roomId="test-room" />);
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("AGORA")).toBeInTheDocument();

    mockUseRoom.mockReturnValue({
      currentNumber: null,
    } as ReturnType<typeof useRoomModule.useRoom>);
    rerender(<CurrentNumber roomId="test-room" />);
    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.queryByText("AGORA")).not.toBeInTheDocument();
  });
});
