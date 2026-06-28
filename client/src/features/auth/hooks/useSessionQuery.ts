import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { getMe } from '../api/auth.service';
import { useEffect } from 'react';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/auth';

/**
 * Checks the user's session on app mount by calling GET /auth/me.
 * If a valid cookie exists, populates the Zustand store.
 * If not, silently fails (user stays unauthenticated).
 */
export const useSessionQuery = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  const query = useQuery({
    queryKey: ['session'],
    queryFn: getMe,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const payload = query.data as ApiResponse<User> | undefined;
  const hasValidSession = payload?.ok === true;
  const sessionUser = payload?.ok === true ? payload.data : null;

  useEffect(() => {
    if (payload?.ok) {
      setUser(payload.data);
    }
    if (query.isError) {
      clearUser();
    }
  }, [payload, query.isError, setUser, clearUser]);

  return {
    isLoading: query.isLoading,
    hasValidSession,
    sessionUser,
    isAuthenticated: hasValidSession,
    user: sessionUser,
  };
};
