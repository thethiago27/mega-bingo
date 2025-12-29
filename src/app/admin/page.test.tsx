import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AdminDashboard } from "./page";
import * as useAdminAuthModule from "@/hooks/use-admin-auth";
import * as firebase from "firebase/database";

// Mock Firebase before any imports
vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
}));

vi.mock("@/hooks/use-admin-auth");
vi.mock("firebase/database");
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("AdminDashboard", () => {
  const mockGet = vi.fn();
  const mockRef = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(firebase, "ref").mockImplementation(mockRef);
    vi.spyOn(firebase, "get").mockImplementation(mockGet);

    mockRef.mockReturnValue("mock-ref");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial Render", () => {
    it("should render welcome message", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => false,
        val: () => null,
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText("Bem-vindo ao Painel de Administração"),
        ).toBeInTheDocument();
      });
    });

    it("should render description text", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => false,
        val: () => null,
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Gerencie suas salas de bingo e controle os jogos em tempo real.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should render create room link", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => false,
        val: () => null,
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Criar Nova Sala")).toBeInTheDocument();
      });
    });

    it("should show loading state initially", () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(<AdminDashboard />);

      expect(screen.getByText("...")).toBeInTheDocument();
    });
  });

  describe("Room Loading", () => {
    it("should load rooms from Firebase on mount", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({
          "room-1": {
            nome: "Sala 1",
            criadoEm: Date.now(),
            ativa: true,
            numerosSorteados: [1, 2, 3],
          },
        }),
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(mockRef).toHaveBeenCalledWith(expect.anything(), "salas");
        expect(mockGet).toHaveBeenCalled();
      });
    });

    it("should handle empty room list", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => false,
        val: () => null,
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Nenhuma sala ativa. Crie uma nova sala para começar.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should handle Firebase errors gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockRejectedValue(new Error("Firebase error"));

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error loading rooms:",
          expect.any(Error),
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Active Rooms Display", () => {
    it("should display active rooms count", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({
          "room-1": {
            nome: "Sala 1",
            criadoEm: Date.now(),
            ativa: true,
            numerosSorteados: [],
          },
          "room-2": {
            nome: "Sala 2",
            criadoEm: Date.now(),
            ativa: true,
            numerosSorteados: [],
          },
        }),
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument();
      });
    });

    it("should display active room details", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({
          ABC123: {
            nome: "Sala Teste",
            criadoEm: Date.now(),
            ativa: true,
            numerosSorteados: [1, 2, 3, 4, 5],
          },
        }),
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Sala ABC123")).toBeInTheDocument();
        expect(screen.getByText("5 número(s) sorteado(s)")).toBeInTheDocument();
        expect(screen.getByText("Ativa")).toBeInTheDocument();
      });
    });

    it("should link to room management page", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({
          TEST123: {
            nome: "Sala Teste",
            criadoEm: Date.now(),
            ativa: true,
            numerosSorteados: [],
          },
        }),
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        const link = screen.getByText("Sala TEST123").closest("a");
        expect(link).toHaveAttribute("href", "/admin/room/TEST123");
      });
    });

    it("should show message when no active rooms", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({
          "room-1": {
            nome: "Sala 1",
            criadoEm: Date.now(),
            ativa: false,
            numerosSorteados: [],
          },
        }),
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Nenhuma sala ativa. Crie uma nova sala para começar.",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Completed Rooms Display", () => {
    it("should display completed rooms section when rooms exist", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({
          "room-1": {
            nome: "Sala 1",
            criadoEm: Date.now(),
            ativa: false,
            numerosSorteados: [1, 2, 3],
          },
        }),
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText("Histórico de Salas Finalizadas"),
        ).toBeInTheDocument();
      });
    });

    it("should not display completed rooms section when no completed rooms", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({
          "room-1": {
            nome: "Sala 1",
            criadoEm: Date.now(),
            ativa: true,
            numerosSorteados: [],
          },
        }),
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(
          screen.queryByText("Histórico de Salas Finalizadas"),
        ).not.toBeInTheDocument();
      });
    });

    it("should display completed room details", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({
          XYZ789: {
            nome: "Sala Finalizada",
            criadoEm: Date.now(),
            ativa: false,
            numerosSorteados: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          },
        }),
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Sala XYZ789")).toBeInTheDocument();
        expect(
          screen.getByText("10 número(s) sorteado(s)"),
        ).toBeInTheDocument();
        expect(screen.getByText("Finalizada")).toBeInTheDocument();
      });
    });

    it("should limit completed rooms display to 5", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      const rooms: Record<string, any> = {};
      for (let i = 1; i <= 10; i++) {
        rooms[`room-${i}`] = {
          nome: `Sala ${i}`,
          criadoEm: Date.now(),
          ativa: false,
          numerosSorteados: [],
        };
      }

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => rooms,
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        const completedSection = screen.getByText(
          "Histórico de Salas Finalizadas",
        ).parentElement;
        const roomLinks = completedSection?.querySelectorAll("a");
        expect(roomLinks?.length).toBe(5);
      });
    });
  });

  describe("Admin Information Display", () => {
    it("should display admin ID", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-123",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => false,
        val: () => null,
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText("test-admin-123")).toBeInTheDocument();
      });
    });

    it("should display account information section", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => false,
        val: () => null,
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Informações da Conta")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Você está usando autenticação anônima. Seu ID é único para esta sessão.",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Statistics Display", () => {
    it("should display correct active rooms count", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({
          "room-1": { ativa: true, numerosSorteados: [] },
          "room-2": { ativa: true, numerosSorteados: [] },
          "room-3": { ativa: false, numerosSorteados: [] },
        }),
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        // Find the statistics card specifically (has green background)
        const activeRoomsCards = screen.getAllByText("Salas Ativas");
        const statsCard = activeRoomsCards.find((el) =>
          el.className.includes("text-green-900"),
        );
        expect(statsCard?.parentElement).toHaveTextContent("2");
      });
    });

    it("should show 0 when no rooms exist", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => false,
        val: () => null,
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        // Find the statistics card specifically (has green background)
        const activeRoomsCards = screen.getAllByText("Salas Ativas");
        const statsCard = activeRoomsCards.find((el) =>
          el.className.includes("text-green-900"),
        );
        expect(statsCard?.parentElement).toHaveTextContent("0");
      });
    });
  });

  describe("Navigation", () => {
    it("should link to create room page", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockResolvedValue({
        exists: () => false,
        val: () => null,
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        const createLink = screen.getByText("Criar Nova Sala").closest("a");
        expect(createLink).toHaveAttribute("href", "/admin/create-room");
      });
    });
  });
});
