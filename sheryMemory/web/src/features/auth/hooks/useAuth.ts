import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { LoginInput, RegisterInput } from '../types/auth.types';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const logoutAction = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  const { data: meData, isLoading: isUserLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response: any) => {
      const data = response.data || response;
      if (data.user) {
        setCredentials(data.user, data.token || '');
        navigate('/dashboard');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (response: any) => {
      const data = response.data || response;
      if (data.user) {
        setCredentials(data.user, data.token || '');
        navigate('/dashboard');
      }
    },
  });

  return {
    user: user || meData?.data,
    isAuthenticated: isAuthenticated || !!meData?.data,
    isUserLoading,
    logout: () => {
      logoutAction();
      navigate('/login');
    },
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
  };
}
