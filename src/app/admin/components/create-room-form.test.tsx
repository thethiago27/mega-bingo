import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CreateRoomForm } from './create-room-form';
import * as useAdminAuthModule from '@/hooks/use-admin-auth';
import * as databaseModule from '@/lib/database';
import * as nextNavigation from 'next/navigation';

// Mock Firebase before any imports
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock dependencies
vi.mock('@/hooks/use-admin-auth');
vi.mock('@/lib/database');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('CreateRoomForm', () => {
  const mockPush = vi.fn();
  const mockBack = vi.fn();
  const mockCreateRoom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(nextNavigation.useRouter).mockReturnValue({
      push: mockPush,
      back: mockBack,
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof nextNavigation.useRouter>);

    vi.spyOn(databaseModule, 'createRoom').mockImplementation(mockCreateRoom);
  });

  describe('Initial Render', () => {
    it('should render form title', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      expect(screen.getByText('Criar Nova Sala de Bingo')).toBeInTheDocument();
    });

    it('should render description text', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      expect(
        screen.getByText(/Clique no botão abaixo para criar uma nova sala/)
      ).toBeInTheDocument();
    });

    it('should render create button', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      expect(
        screen.getByRole('button', { name: /criar sala/i })
      ).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      expect(
        screen.getByRole('button', { name: /cancelar/i })
      ).toBeInTheDocument();
    });

    it('should render instructions section', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      expect(screen.getByText('Como funciona?')).toBeInTheDocument();
      expect(
        screen.getByText(/A sala será criada com um código único/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Compartilhe o código com os jogadores/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Os jogadores podem entrar usando o código/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Você poderá sortear números quando estiver pronto/)
      ).toBeInTheDocument();
    });

    it('should not show error message initially', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      expect(screen.queryByText(/Erro ao criar sala/)).not.toBeInTheDocument();
    });
  });

  describe('Room Creation', () => {
    it('should call createRoom with correct parameters when button is clicked', async () => {
      const user = userEvent.setup();
      mockCreateRoom.mockResolvedValue('test-room-123');

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      const createButton = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockCreateRoom).toHaveBeenCalledWith('Sala do Admin');
      });
    });

    it('should redirect to room management page after successful creation', async () => {
      const user = userEvent.setup();
      mockCreateRoom.mockResolvedValue('test-room-123');

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      const createButton = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/room/test-room-123');
      });
    });

    it('should show loading state while creating room', async () => {
      const user = userEvent.setup();
      mockCreateRoom.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve('test-room'), 100))
      );

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      const createButton = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton);

      expect(screen.getByText('Criando sala...')).toBeInTheDocument();
      expect(createButton).toBeDisabled();
    });

    it('should disable cancel button while creating room', async () => {
      const user = userEvent.setup();
      mockCreateRoom.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve('test-room'), 100))
      );

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      const createButton = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton);

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should show error message when adminId is not available', async () => {
      const user = userEvent.setup();

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: null,
        isAuthenticated: false,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      const createButton = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton);

      expect(screen.getByText(/Admin ID não encontrado/)).toBeInTheDocument();
      expect(mockCreateRoom).not.toHaveBeenCalled();
    });

    it('should show error message when room creation fails', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockCreateRoom.mockRejectedValue(new Error('Database error'));

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      const createButton = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Erro ao criar sala. Por favor, tente novamente./)
        ).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should re-enable button after error', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockCreateRoom.mockRejectedValue(new Error('Database error'));

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      const createButton = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(createButton).not.toBeDisabled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should clear previous error when creating new room', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      // First attempt fails
      mockCreateRoom.mockRejectedValueOnce(new Error('Database error'));

      render(<CreateRoomForm />);

      const createButton = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/Erro ao criar sala/)).toBeInTheDocument();
      });

      // Second attempt succeeds
      mockCreateRoom.mockResolvedValueOnce('test-room-456');
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/Erro ao criar sala/)
        ).not.toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Cancel Button', () => {
    it('should call router.back when cancel button is clicked', async () => {
      const user = userEvent.setup();

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should not call createRoom when cancel is clicked', async () => {
      const user = userEvent.setup();

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockCreateRoom).not.toHaveBeenCalled();
    });
  });

  describe('UI Styling', () => {
    it('should render with correct container classes', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      const { container } = render(<CreateRoomForm />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('bg-white');
      expect(mainDiv).toHaveClass('shadow');
      expect(mainDiv).toHaveClass('rounded-lg');
    });

    it('should apply disabled styles to create button when creating', async () => {
      const user = userEvent.setup();
      mockCreateRoom.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve('test-room'), 100))
      );

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      const createButton = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton);

      expect(createButton).toHaveClass('disabled:bg-blue-300');
      expect(createButton).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should display error with correct styling', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockCreateRoom.mockRejectedValue(new Error('Database error'));

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      render(<CreateRoomForm />);

      const createButton = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton);

      await waitFor(() => {
        const errorDiv = screen.getByText(/Erro ao criar sala/).parentElement;
        expect(errorDiv).toHaveClass('bg-red-50');
        expect(errorDiv).toHaveClass('border-red-200');
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Multiple Room Creation', () => {
    it('should allow creating multiple rooms sequentially', async () => {
      const user = userEvent.setup();

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        adminId: 'test-admin-id',
        isAuthenticated: true,
        loading: false,
        loginAnonymously: vi.fn(),
        logout: vi.fn(),
        error: null,
      });

      // First room creation
      mockCreateRoom.mockResolvedValueOnce('room-1');
      const { unmount } = render(<CreateRoomForm />);

      const createButton = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/room/room-1');
      });

      // Clean up and create second room
      unmount();
      mockPush.mockClear();
      mockCreateRoom.mockResolvedValueOnce('room-2');

      render(<CreateRoomForm />);
      const createButton2 = screen.getByRole('button', { name: /criar sala/i });
      await user.click(createButton2);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/room/room-2');
      });
    });
  });
});
