import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from './authApi';
import { ApiRequestError } from '@/api/client';
import type { LoginInput, RegisterInput, PublicUser } from '@idevrx/types';

const AUTH_KEY = ['auth', 'me'] as const;

export function useCurrentUser() {
  const q = useQuery({
    queryKey: AUTH_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });

  const isGuest = q.error instanceof ApiRequestError && q.error.status === 401;
  return {
    user: q.data?.user ?? null,
    isLoading: q.isLoading,
    isGuest,
    refetch: q.refetch,
  };
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: AUTH_KEY }),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: AUTH_KEY }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      qc.setQueryData(AUTH_KEY, null);
      qc.invalidateQueries({ queryKey: AUTH_KEY });
    },
  });
}

// UX helpers only. The backend is the authority.
export function isCreator(user: PublicUser | null) {
  return !!user?.roles.includes('creator');
}
export function isModerator(user: PublicUser | null) {
  return (
    !!user?.roles.includes('moderator') ||
    !!user?.roles.includes('admin') ||
    !!user?.roles.includes('ceo')
  );
}
export function isAdmin(user: PublicUser | null) {
  return !!user?.roles.includes('admin') || !!user?.roles.includes('ceo');
}
