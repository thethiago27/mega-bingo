import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AdminDashboardContent } from "./AdminDashboardContent";
import * as useAdminAuthModule from "@/hooks/use-admin-auth";
import * as firebaseDatabase from "firebase/database";

// Mock Firebase before any imports
vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
}));

// Mock dependencies
vi.mock("@/hooks/use-admin-auth");
vi.mock("firebase/database");
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AdminDashboardContent", () => {
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(firebaseDatabase, "ref").mockReturnValue({} as never);
    vi.spyOn(firebaseDatabase, "get").mockImplementation(mockGet);
  });

  describe("Initial Render", () => {
    it("should render welcome message", () => {
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

      render(<AdminDashboardContent />);

      expect(
        screen.getByText("Bem-vindo ao Painel de Administração"),
      ).toBeInTheDocument();
    });

    it("should render description text", () => {
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

      render(<AdminDashboardContent />);

      expect(
        screen.getByText(
          "Gerencie suas salas de bingo e controle os jogos em tempo real.",
        ),
      ).toBeInTheDocument();
    });

    it("should render create room link", () => {
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

      render(<AdminDashboardContent />);

      const createLink = screen.getByText("Criar Nova Sala").closest("a");
      expect(createLink).toHaveAttribute("href", "/admin/create-room");
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
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  exists: () => false,
                  val: () => null,
                }),
              100,
            ),
          ),
      );

      render(<AdminDashboardContent />);

      expect(screen.getByText("...")).toBeInTheDocument();
      expect(screen.getByText("Carregando...")).toBeInTheDocument();
    });

    it("should display admin ID", () => {
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

      render(<AdminDashboardContent />);

      expect(screen.getByText("test-admin-123")).toBeInTheDocument();
    });
  });

  describe("Loading Salas", () => {
    it("should fetch salas from Firebase on mount", async () => {
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

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(firebaseDatabase.ref).toHaveBeenCalledWith({}, "salas");
        expect(mockGet).toHaveBeenCalled();
      });
    });

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
            ativa: true,
            numerosSorteados: [1, 2, 3],
          },
          "room-2": {
            nome: "Sala 2",
            ativa: true,
            numerosSorteados: [4, 5],
          },
          "room-3": {
            nome: "Sala 3",
            ativa: false,
            numerosSorteados: [6],
          },
        }),
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument();
      });
    });

    it("should handle empty database", async () => {
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

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Nenhuma sala ativa. Crie uma nova sala para começar.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should handle Firebase errors silently", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      mockGet.mockRejectedValue(new Error("Database error"));

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Nenhuma sala ativa. Crie uma nova sala para começar.",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Active Rooms Display", () => {
    it("should display active rooms list", async () => {
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
            nome: "Sala Test",
            ativa: true,
            numerosSorteados: [1, 2, 3, 4, 5],
          },
        }),
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(screen.getByText("Sala ABC123")).toBeInTheDocument();
        expect(screen.getByText("5 número(s) sorteado(s)")).toBeInTheDocument();
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
          XYZ789: {
            nome: "Sala Test",
            ativa: true,
            numerosSorteados: [],
          },
        }),
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        const roomLink = screen.getByText("Sala XYZ789").closest("a");
        expect(roomLink).toHaveAttribute("href", "/admin/room/XYZ789");
      });
    });

    it("should display active badge for active rooms", async () => {
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
            ativa: true,
            numerosSorteados: [],
          },
        }),
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(screen.getByText("Ativa")).toBeInTheDocument();
      });
    });

    it("should handle rooms with no drawn numbers", async () => {
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
            ativa: true,
          },
        }),
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(screen.getByText("0 número(s) sorteado(s)")).toBeInTheDocument();
      });
    });

    it("should display multiple active rooms", async () => {
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
            ativa: true,
            numerosSorteados: [1, 2],
          },
          "room-2": {
            nome: "Sala 2",
            ativa: true,
            numerosSorteados: [3, 4, 5],
          },
          "room-3": {
            nome: "Sala 3",
            ativa: true,
            numerosSorteados: [],
          },
        }),
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(screen.getByText("Sala room-1")).toBeInTheDocument();
        expect(screen.getByText("Sala room-2")).toBeInTheDocument();
        expect(screen.getByText("Sala room-3")).toBeInTheDocument();
      });
    });
  });

  describe("Completed Rooms Display", () => {
    it("should display completed rooms section when available", async () => {
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
            ativa: false,
            numerosSorteados: [1, 2, 3],
          },
        }),
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(
          screen.getByText("Histórico de Salas Finalizadas"),
        ).toBeInTheDocument();
      });
    });

    it("should not display completed rooms section when none exist", async () => {
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
            ativa: true,
            numerosSorteados: [],
          },
        }),
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(
          screen.queryByText("Histórico de Salas Finalizadas"),
        ).not.toBeInTheDocument();
      });
    });

    it("should display completed badge for finished rooms", async () => {
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
            ativa: false,
            numerosSorteados: [1, 2, 3],
          },
        }),
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(screen.getByText("Finalizada")).toBeInTheDocument();
      });
    });

    it("should limit completed rooms to 5", async () => {
      vi.spyOn(useAdminAuthModule, "useAdminAuth").mockReturnValue({
        adminId: "test-admin-id",
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      const rooms: Record<string, unknown> = {};
      for (let i = 1; i <= 10; i++) {
        rooms[`room-${i}`] = {
          nome: `Sala ${i}`,
          ativa: false,
          numerosSorteados: [i],
        };
      }

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => rooms,
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        const finishedRooms = screen.getAllByText("Finalizada");
        expect(finishedRooms).toHaveLength(5);
      });
    });

    it("should link completed rooms to management page", async () => {
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
          DONE123: {
            nome: "Sala Finalizada",
            ativa: false,
            numerosSorteados: [1, 2, 3],
          },
        }),
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        const roomLink = screen.getByText("Sala DONE123").closest("a");
        expect(roomLink).toHaveAttribute("href", "/admin/room/DONE123");
      });
    });
  });

  describe("Mixed Active and Completed Rooms", () => {
    it("should correctly separate active and completed rooms", async () => {
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
          "active-1": {
            nome: "Active Room 1",
            ativa: true,
            numerosSorteados: [1, 2],
          },
          "active-2": {
            nome: "Active Room 2",
            ativa: true,
            numerosSorteados: [3],
          },
          "done-1": {
            nome: "Done Room 1",
            ativa: false,
            numerosSorteados: [4, 5, 6],
          },
          "done-2": {
            nome: "Done Room 2",
            ativa: false,
            numerosSorteados: [7],
          },
        }),
      });

      render(<AdminDashboardContent />);

      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument(); // Active count
        expect(screen.getAllByText("Ativa")).toHaveLength(2);
        expect(screen.getAllByText("Finalizada")).toHaveLength(2);
      });
    });
  });

  describe("Account Information", () => {
    it("should display account information section", () => {
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

      render(<AdminDashboardContent />);

      expect(screen.getByText("Informações da Conta")).toBeInTheDocument();
    });

    it("should display anonymous auth message", () => {
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

      render(<AdminDashboardContent />);

      expect(
        screen.getByText(
          "Você está usando autenticação anônima. Seu ID é único para esta sessão.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("UI Styling", () => {
    it("should render with correct container classes", () => {
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

      const { container } = render(<AdminDashboardContent />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass("space-y-6");
    });

    it("should apply correct styling to create room link", () => {
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

      render(<AdminDashboardContent />);

      const createLink = screen.getByText("Criar Nova Sala").closest("a");
      expect(createLink).toHaveClass("bg-blue-50");
      expect(createLink).toHaveClass("hover:bg-blue-100");
    });
  });
});
