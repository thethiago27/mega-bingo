import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { RoomNotFound } from "./room-not-found";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("RoomNotFound", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("should render the not found message", () => {
    render(<RoomNotFound />);

    expect(screen.getByText(/sala não encontrada/i)).toBeInTheDocument();
  });

  it("should render a button to go back to home", () => {
    render(<RoomNotFound />);

    const backButton = screen.getByRole("button", {
      name: /voltar/i,
    });
    expect(backButton).toBeInTheDocument();
  });

  it("should navigate to home when button is clicked", async () => {
    const user = userEvent.setup();
    render(<RoomNotFound />);

    const backButton = screen.getByRole("button", {
      name: /voltar/i,
    });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
