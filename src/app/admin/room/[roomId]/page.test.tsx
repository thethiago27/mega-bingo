import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import AdminRoomPage from './page';
import * as databaseModule from '@/lib/database';
import * as nextNavigation from 'next/navigation';

// Mock Firebase before any imports
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

vi.mock('@/lib/database');
vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

describe('AdminRoomPage', () => {
  const mockPush = vi.fn();
  const mockListenRoom = vi.fn();
  const mockListenPlayers = vi.fn();
  const mockDrawNumber = vi.fn();
  const mockRegistrarVencedor = vi.fn();
  const mockIniciarNovaRodada = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(nextNavigation.useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof nextNavigation.useRouter>);

    vi.mocked(nextNavigation.useParams).mockReturnValue({
      roomId: 'TEST123',
    });

    vi.spyOn(databaseModule, 'listenRoom').mockImplementation(mockListenRoom);
    vi.spyOn(databaseModule, 'listenPlayers').mockImplementation(
      mockListenPlayers
    );
    vi.spyOn(databaseModule, 'drawNumber').mockImplementation(mockDrawNumber);
    vi.spyOn(databaseModule, 'registrarVencedor').mockImplementation(
      mockRegistrarVencedor
    );
    vi.spyOn(databaseModule, 'iniciarNovaRodada').mockImplementation(
      mockIniciarNovaRodada
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render and Loading', () => {
    it('should show loading state initially', () => {
      mockListenRoom.mockReturnValue(vi.fn());
      mockListenPlayers.mockReturnValue(vi.fn());

      render(<AdminRoomPage />);

      expect(screen.getByText('Carregando sala...')).toBeInTheDocument();
      const spinner =
        screen.getByText('Carregando sala...').previousElementSibling;
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should call listenRoom with correct roomId', () => {
      mockListenRoom.mockReturnValue(vi.fn());
      mockListenPlayers.mockReturnValue(vi.fn());

      render(<AdminRoomPage />);

      expect(mockListenRoom).toHaveBeenCalledWith(
        'TEST123',
        expect.any(Function)
      );
    });

    it('should call listenPlayers with correct roomId', () => {
      mockListenRoom.mockReturnValue(vi.fn());
      mockListenPlayers.mockReturnValue(vi.fn());

      render(<AdminRoomPage />);

      expect(mockListenPlayers).toHaveBeenCalledWith(
        'TEST123',
        expect.any(Function)
      );
    });
  });

  describe('Error Handling', () => {
    it('should show error when room is not found', async () => {
      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(null);
        return vi.fn();
      });
      mockListenPlayers.mockReturnValue(vi.fn());

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText('Erro ao Carregar Sala')).toBeInTheDocument();
      });
    });

    it('should show error message when room does not exist', async () => {
      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(null);
        return vi.fn();
      });
      mockListenPlayers.mockReturnValue(vi.fn());

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText('Sala não encontrada')).toBeInTheDocument();
      });
    });

    it('should show back to dashboard button on error', async () => {
      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(null);
        return vi.fn();
      });
      mockListenPlayers.mockReturnValue(vi.fn());

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /voltar ao dashboard/i })
        ).toBeInTheDocument();
      });
    });

    it('should navigate to admin dashboard when back button clicked', async () => {
      const user = userEvent.setup();
      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(null);
        return vi.fn();
      });
      mockListenPlayers.mockReturnValue(vi.fn());

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText('Erro ao Carregar Sala')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', {
        name: /voltar ao dashboard/i,
      });
      await user.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  describe('Room Display', () => {
    it('should display room information when loaded', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [1, 2, 3],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText('Sala TEST123')).toBeInTheDocument();
      });
    });

    it('should display room code prominently', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText('Sala TEST123')).toBeInTheDocument();
      });
    });

    it('should display player count', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: Array.from({ length: 20 }, (_, i) => i + 1),
          numerosMarcados: [],
        },
        'player-2': {
          id: 'player-2',
          nome: 'Bob',
          cartela: Array.from({ length: 20 }, (_, i) => i + 21),
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText(/2 jogador/)).toBeInTheDocument();
      });
    });

    it('should display drawn numbers count', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [1, 2, 3, 4, 5],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText(/5 número/)).toBeInTheDocument();
      });
    });
  });

  describe('Number Drawing', () => {
    it('should display draw number button', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /sortear número/i })
        ).toBeInTheDocument();
      });
    });

    it('should call drawNumber when button clicked', async () => {
      const user = userEvent.setup();
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });
      mockDrawNumber.mockResolvedValue(42);

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sortear número/i }));
      });

      const drawButton = screen.getByRole('button', {
        name: /sortear número/i,
      });
      await user.click(drawButton);

      expect(mockDrawNumber).toHaveBeenCalledWith('TEST123');
    });

    it('should show loading state while drawing', async () => {
      const user = userEvent.setup();
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });
      mockDrawNumber.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(42), 100))
      );

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sortear número/i }));
      });

      const drawButton = screen.getByRole('button', {
        name: /sortear número/i,
      });
      await user.click(drawButton);

      expect(screen.getByText('Sorteando...')).toBeInTheDocument();
      expect(drawButton).toBeDisabled();
    });

    it('should display last drawn number', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [1, 2, 3, 42],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText('Último número')).toBeInTheDocument();
        // Check that 42 appears in the large display circle
        const lastNumberDisplay =
          screen.getByText('Último número').previousElementSibling;
        expect(lastNumberDisplay).toHaveTextContent('42');
      });
    });

    it('should disable draw button when all numbers drawn', async () => {
      const allNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: allNumbers,
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        const drawButton = screen.getByRole('button', {
          name: /sortear número/i,
        });
        expect(drawButton).toBeDisabled();
      });
    });

    it('should show message when all numbers drawn', async () => {
      const allNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: allNumbers,
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Todos os números foram sorteados')
        ).toBeInTheDocument();
      });
    });

    it('should set error state when draw fails', async () => {
      const user = userEvent.setup();
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });
      mockDrawNumber.mockRejectedValue(new Error('Network error'));

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sortear número/i }));
      });

      const drawButton = screen.getByRole('button', {
        name: /sortear número/i,
      });
      await user.click(drawButton);

      await waitFor(() => {
        expect(screen.getByText(/erro ao sortear/i)).toBeInTheDocument();
      });
    });
  });

  describe('Player List', () => {
    it('should show message when no players', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/nenhum jogador na sala ainda/i)
        ).toBeInTheDocument();
      });
    });

    it('should display player names', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: Array.from({ length: 20 }, (_, i) => i + 1),
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });
    });

    it('should display player progress', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [1, 2, 3],
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20,
          ],
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText('3/20')).toBeInTheDocument();
      });
    });

    it('should show progress bar for each player', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [1, 2, 3],
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20,
          ],
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        const progressBars = screen
          .getAllByRole('generic')
          .filter((el) => el.className.includes('bg-blue-600'));
        expect(progressBars.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Winner Detection', () => {
    it('should detect and display winner', async () => {
      const drawnNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: drawnNumbers,
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: drawnNumbers,
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        // UI shows "🎉 X Vencedor(es)!" in the header
        expect(screen.getByText(/🎉.*Vencedor/)).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });
    });

    it('should highlight winner in player list', async () => {
      const drawnNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: drawnNumbers,
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: drawnNumbers,
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText(/Alice 🎉/)).toBeInTheDocument();
      });
    });

    it('should show multiple winners', async () => {
      const drawnNumbers = Array.from({ length: 40 }, (_, i) => i + 1);
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: drawnNumbers,
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: Array.from({ length: 20 }, (_, i) => i + 1),
          numerosMarcados: [],
        },
        'player-2': {
          id: 'player-2',
          nome: 'Bob',
          cartela: Array.from({ length: 20 }, (_, i) => i + 21),
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        // UI shows winner names in the header
        expect(screen.getByText(/2 Vencedor/)).toBeInTheDocument();
        expect(screen.getByText(/Alice, Bob/)).toBeInTheDocument();
      });
    });

    it('should auto-register winner when detected', async () => {
      const drawnNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: drawnNumbers,
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: drawnNumbers,
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });
      mockRegistrarVencedor.mockResolvedValue(undefined);

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(mockRegistrarVencedor).toHaveBeenCalledWith(
          'TEST123',
          'player-1',
          'Alice'
        );
      });
    });

    it('should not re-register already registered winner', async () => {
      const drawnNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: drawnNumbers,
        rodadaAtual: 1,
        vencedores: [
          {
            jogadorId: 'player-1',
            nome: 'Alice',
            rodada: 1,
            timestamp: Date.now(),
          },
        ],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: drawnNumbers,
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText(/🎉.*Vencedor/)).toBeInTheDocument();
      });

      expect(mockRegistrarVencedor).not.toHaveBeenCalled();
    });

    it('should disable draw button when there is a winner', async () => {
      const drawnNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: drawnNumbers,
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: drawnNumbers,
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        const drawButton = screen.getByRole('button', {
          name: /sortear número/i,
        });
        expect(drawButton).toBeDisabled();
      });
    });
  });

  describe('Round Management', () => {
    it('should display current round number', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 3,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockReturnValue(vi.fn());

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText(/rodada 3/i)).toBeInTheDocument();
      });
    });

    it('should show new round button when there is a winner', async () => {
      const drawnNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: drawnNumbers,
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: drawnNumbers,
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /nova rodada/i })
        ).toBeInTheDocument();
      });
    });

    it('should call iniciarNovaRodada when new round button clicked', async () => {
      const user = userEvent.setup();
      const drawnNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: drawnNumbers,
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: drawnNumbers,
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });
      mockIniciarNovaRodada.mockResolvedValue(undefined);

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /nova rodada/i })
        ).toBeInTheDocument();
      });

      const newRoundButton = screen.getByRole('button', {
        name: /nova rodada/i,
      });
      await user.click(newRoundButton);

      expect(mockIniciarNovaRodada).toHaveBeenCalledWith('TEST123');
    });

    it('should display total winners count', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 3,
        vencedores: [
          { jogadorId: 'p1', nome: 'Alice', rodada: 1, timestamp: Date.now() },
          { jogadorId: 'p2', nome: 'Bob', rodada: 2, timestamp: Date.now() },
        ],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        // Total de vitórias shows the count
        expect(screen.getByText('Total de vitórias:')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });

  describe('Statistics Display', () => {
    it('should display statistics section', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText('Estatísticas')).toBeInTheDocument();
      });
    });

    it('should display correct statistics', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [1, 2, 3, 4, 5],
        rodadaAtual: 1,
        vencedores: [],
      };

      const mockJogadores = {
        'player-1': {
          id: 'player-1',
          nome: 'Alice',
          cartela: Array.from({ length: 20 }, (_, i) => i + 1),
          numerosMarcados: [],
        },
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback(mockJogadores);
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText('5/100')).toBeInTheDocument();
      });
    });
  });

  describe('Drawn Numbers Display', () => {
    it('should show message when no numbers drawn', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/nenhum número sorteado ainda/i)
        ).toBeInTheDocument();
      });
    });

    it('should display all drawn numbers', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [11, 22, 33, 44, 54],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByText('Números Sorteados (5)')).toBeInTheDocument();
        // Check for numbers in the drawn numbers grid
        expect(screen.getByText('11')).toBeInTheDocument();
        expect(screen.getByText('22')).toBeInTheDocument();
        expect(screen.getByText('33')).toBeInTheDocument();
        expect(screen.getByText('44')).toBeInTheDocument();
        // 54 appears both as last number and in grid, so use getAllByText
        expect(screen.getAllByText('54').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Navigation', () => {
    it('should show back to dashboard button', async () => {
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /voltar ao dashboard/i })
        ).toBeInTheDocument();
      });
    });

    it('should navigate back when button clicked', async () => {
      const user = userEvent.setup();
      const mockSala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [],
        rodadaAtual: 1,
        vencedores: [],
      };

      mockListenRoom.mockImplementation((roomId, callback) => {
        callback(mockSala);
        return vi.fn();
      });
      mockListenPlayers.mockImplementation((roomId, callback) => {
        callback({});
        return vi.fn();
      });

      render(<AdminRoomPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /voltar ao dashboard/i }));
      });

      const backButton = screen.getByRole('button', {
        name: /voltar ao dashboard/i,
      });
      await user.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  describe('Real-time Updates', () => {
    it('should cleanup listeners on unmount', () => {
      const unsubscribeRoom = vi.fn();
      const unsubscribePlayers = vi.fn();

      mockListenRoom.mockReturnValue(unsubscribeRoom);
      mockListenPlayers.mockReturnValue(unsubscribePlayers);

      const { unmount } = render(<AdminRoomPage />);

      unmount();

      expect(unsubscribeRoom).toHaveBeenCalled();
      expect(unsubscribePlayers).toHaveBeenCalled();
    });

    it('should update when room data changes', async () => {
      type SalaCallback = (sala: databaseModule.Sala | null) => void;
      type JogadoresCallback = (
        jogadores: Record<string, databaseModule.Jogador>
      ) => void;
      let roomCallback: SalaCallback | null = null;

      mockListenRoom.mockImplementation(
        (roomId: string, callback: SalaCallback) => {
          roomCallback = callback;
          return vi.fn();
        }
      );
      mockListenPlayers.mockImplementation(
        (roomId: string, callback: JogadoresCallback) => {
          callback({});
          return vi.fn();
        }
      );

      render(<AdminRoomPage />);

      const initialSala: databaseModule.Sala = {
        id: 'TEST123',
        nome: 'Test Room',
        criadoEm: Date.now(),
        ativa: true,
        numerosSorteados: [1],
        rodadaAtual: 1,
        vencedores: [],
      };

      roomCallback!(initialSala);

      await waitFor(() => {
        expect(screen.getByText(/1 número/)).toBeInTheDocument();
      });

      const updatedSala: databaseModule.Sala = {
        ...initialSala,
        numerosSorteados: [1, 2, 3],
      };

      roomCallback!(updatedSala);

      await waitFor(() => {
        expect(screen.getByText(/3 número/)).toBeInTheDocument();
      });
    });
  });
});
