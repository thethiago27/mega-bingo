import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import AdminLoginPage from './page';
import * as useAdminAuthModule from '@/hooks/use-admin-auth';
import * as nextNavigation from 'next/navigation';

// Mock Firebase before any imports
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

vi.mock('@/hooks/use-admin-auth');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('AdminLoginPage', () => {
  const mockPush = vi.fn();
  const mockLoginAnonymously = vi.fn();

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
  });

  describe('Initial Render', () => {
    it('should render page title and subtitle', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: true,
        error: null,
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      expect(screen.getByText('Mega Bingo')).toBeInTheDocument();
      expect(screen.getByText('Painel Administrativo')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: true,
        error: null,
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      expect(screen.getByText('Entrando...')).toBeInTheDocument();
      const spinner = screen.getByText('Entrando...').previousElementSibling;
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Automatic Login', () => {
    it('should call loginAnonymously on mount when not authenticated', async () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: null,
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      await waitFor(() => {
        expect(mockLoginAnonymously).toHaveBeenCalledTimes(1);
      });
    });

    it('should redirect to /admin after successful login', async () => {
      mockLoginAnonymously.mockResolvedValue(undefined);

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: null,
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin');
      });
    });

    it('should not call loginAnonymously if already authenticated', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: null,
        isAuthenticated: true,
        adminId: 'test-admin-id',
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      expect(mockLoginAnonymously).not.toHaveBeenCalled();
    });

    it('should redirect to /admin immediately if already authenticated', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: null,
        isAuthenticated: true,
        adminId: 'test-admin-id',
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when login fails', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: 'Erro ao fazer login',
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      expect(screen.getByText('Erro ao fazer login')).toBeInTheDocument();
    });

    it('should show retry button when error occurs', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: 'Erro ao fazer login',
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      expect(
        screen.getByRole('button', { name: /tentar novamente/i })
      ).toBeInTheDocument();
    });

    it('should call loginAnonymously when retry button is clicked', async () => {
      const user = userEvent.setup();

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: 'Erro ao fazer login',
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      const retryButton = screen.getByRole('button', {
        name: /tentar novamente/i,
      });
      await user.click(retryButton);

      expect(mockLoginAnonymously).toHaveBeenCalled();
    });

    it('should show back to home button when error occurs', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: 'Erro ao fazer login',
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      expect(
        screen.getByRole('button', { name: /voltar para página inicial/i })
      ).toBeInTheDocument();
    });

    it('should navigate to home when back button is clicked', async () => {
      const user = userEvent.setup();

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: 'Erro ao fazer login',
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      const backButton = screen.getByRole('button', {
        name: /voltar para página inicial/i,
      });
      await user.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner when loading is true', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: true,
        error: null,
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      const spinner = screen.getByText('Entrando...').previousElementSibling;
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should not show error UI when loading', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: true,
        error: null,
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      expect(
        screen.queryByRole('button', { name: /tentar novamente/i })
      ).not.toBeInTheDocument();
    });

    it('should not show loading UI when error occurs', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: 'Erro ao fazer login',
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      expect(screen.queryByText('Entrando...')).not.toBeInTheDocument();
    });
  });

  describe('UI Styling', () => {
    it('should render with correct container classes', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: true,
        error: null,
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      const { container } = render(<AdminLoginPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('min-h-screen');
      expect(mainDiv).toHaveClass('bg-gradient-to-br');
      expect(mainDiv).toHaveClass('from-purple-600');
      expect(mainDiv).toHaveClass('to-blue-600');
    });

    it('should render card with correct styling', () => {
      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: true,
        error: null,
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      render(<AdminLoginPage />);

      const card = screen.getByText('Mega Bingo').parentElement;
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('shadow-xl');
      expect(card).toHaveClass('text-center');
    });
  });

  describe('Effect Dependencies', () => {
    it('should re-run effect when isAuthenticated changes', () => {
      const { rerender } = render(<AdminLoginPage />);

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: null,
        isAuthenticated: false,
        adminId: null,
        logout: vi.fn(),
      });

      rerender(<AdminLoginPage />);

      vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
        loginAnonymously: mockLoginAnonymously,
        loading: false,
        error: null,
        isAuthenticated: true,
        adminId: 'test-id',
        logout: vi.fn(),
      });

      rerender(<AdminLoginPage />);

      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });
});
