import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import EntrarRoomPage from "./page";

// Mock components
vi.mock("@/components/AppHeader", () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="app-header">{title}</div>
  ),
}));

vi.mock("@/components/bingo/hero-section", () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="hero-section">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock("./components/join-form-with-room-id", () => ({
  JoinFormWithRoomId: ({ roomId }: { roomId: string }) => (
    <div data-testid="join-form-with-room-id">Room ID: {roomId}</div>
  ),
}));

describe("EntrarRoomPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial Render", () => {
    it("should render AppHeader with correct title", async () => {
      const params = Promise.resolve({ roomId: "ABC123" });
      render(await EntrarRoomPage({ params }));

      expect(screen.getByTestId("app-header")).toHaveTextContent(
        "Bingo Mobile",
      );
    });

    it("should render HeroSection with welcome message", async () => {
      const params = Promise.resolve({ roomId: "ABC123" });
      render(await EntrarRoomPage({ params }));

      const heroSection = screen.getByTestId("hero-section");
      expect(heroSection).toHaveTextContent("Bem-vindo!");
      expect(heroSection).toHaveTextContent(
        "Para começar a diversão, diga-nos quem vai jogar hoje.",
      );
    });

    it("should render JoinFormWithRoomId with correct roomId", async () => {
      const params = Promise.resolve({ roomId: "TEST456" });
      render(await EntrarRoomPage({ params }));

      const form = screen.getByTestId("join-form-with-room-id");
      expect(form).toHaveTextContent("Room ID: TEST456");
    });
  });

  describe("Room ID Handling", () => {
    it("should pass roomId from params to JoinFormWithRoomId", async () => {
      const params = Promise.resolve({ roomId: "XYZ789" });
      render(await EntrarRoomPage({ params }));

      expect(screen.getByTestId("join-form-with-room-id")).toHaveTextContent(
        "Room ID: XYZ789",
      );
    });

    it("should handle different room ID formats", async () => {
      const params = Promise.resolve({ roomId: "ROOM-123-ABC" });
      render(await EntrarRoomPage({ params }));

      expect(screen.getByTestId("join-form-with-room-id")).toHaveTextContent(
        "Room ID: ROOM-123-ABC",
      );
    });

    it("should handle numeric room IDs", async () => {
      const params = Promise.resolve({ roomId: "12345" });
      render(await EntrarRoomPage({ params }));

      expect(screen.getByTestId("join-form-with-room-id")).toHaveTextContent(
        "Room ID: 12345",
      );
    });
  });

  describe("Layout Structure", () => {
    it("should render with correct container classes", async () => {
      const params = Promise.resolve({ roomId: "ABC123" });
      const { container } = render(await EntrarRoomPage({ params }));

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass("min-h-screen");
      expect(mainDiv).toHaveClass("bg-gray-50");
      expect(mainDiv).toHaveClass("flex-col");
    });

    it("should render main element with correct structure", async () => {
      const params = Promise.resolve({ roomId: "ABC123" });
      render(await EntrarRoomPage({ params }));

      const main = screen.getByRole("main");
      expect(main).toHaveClass("flex-1");
      expect(main).toHaveClass("max-w-md");
      expect(main).toHaveClass("mx-auto");
    });

    it("should render form container with correct spacing", async () => {
      const params = Promise.resolve({ roomId: "ABC123" });
      const { container } = render(await EntrarRoomPage({ params }));

      const formContainer = container.querySelector(".w-full.mt-4");
      expect(formContainer).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("should render all main components in correct order", async () => {
      const params = Promise.resolve({ roomId: "ABC123" });
      const { container } = render(await EntrarRoomPage({ params }));

      const elements = container.querySelectorAll("[data-testid]");
      expect(elements[0]).toHaveAttribute("data-testid", "app-header");
      expect(elements[1]).toHaveAttribute("data-testid", "hero-section");
      expect(elements[2]).toHaveAttribute(
        "data-testid",
        "join-form-with-room-id",
      );
    });

    it("should pass correct props to all components", async () => {
      const params = Promise.resolve({ roomId: "PROPS123" });
      render(await EntrarRoomPage({ params }));

      expect(screen.getByTestId("app-header")).toHaveTextContent(
        "Bingo Mobile",
      );
      expect(screen.getByTestId("hero-section")).toHaveTextContent(
        "Bem-vindo!",
      );
      expect(screen.getByTestId("join-form-with-room-id")).toHaveTextContent(
        "Room ID: PROPS123",
      );
    });
  });

  describe("Async Params Handling", () => {
    it("should await params before rendering", async () => {
      const params = Promise.resolve({ roomId: "ASYNC123" });
      const result = await EntrarRoomPage({ params });

      expect(result).toBeDefined();
    });

    it("should handle params resolution correctly", async () => {
      const params = Promise.resolve({ roomId: "RESOLVE123" });
      render(await EntrarRoomPage({ params }));

      expect(screen.getByTestId("join-form-with-room-id")).toHaveTextContent(
        "Room ID: RESOLVE123",
      );
    });
  });
});
