import { useAuthStore } from '@/stores/auth.store';
import { resolveAuthUser } from '../utils/resolveAuthUser';
import { useSessionQuery } from './useSessionQuery';

/**
 * Canonical authenticated user for routing: merges Zustand store with GET /auth/me.
 */
export function useAuthUser() {
  const storeUser = useAuthStore((s) => s.user);
  const isStoreAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isLoading, hasValidSession, sessionUser } = useSessionQuery();

  const user = resolveAuthUser(storeUser, sessionUser);
  const isAuthenticated = isStoreAuthenticated || hasValidSession;

  return {
    user,
    isLoading,
    isAuthenticated,
    hasValidSession,
  };
}
