import type { User } from '@/types/auth';

/**
 * Merges store and /me session users. Session (/me) wins for profile fields
 * so redirects stay correct after login (login payload may omit profile data).
 */
export function resolveAuthUser(
  storeUser: User | null | undefined,
  sessionUser: User | null | undefined,
): User | null {
  if (!storeUser && !sessionUser) return null;
  if (!storeUser) return sessionUser ?? null;
  if (!sessionUser) return storeUser;

  return {
    ...storeUser,
    ...sessionUser,
    hasStudentProfile:
      sessionUser.hasStudentProfile !== undefined
        ? sessionUser.hasStudentProfile
        : storeUser.hasStudentProfile,
    studentId: sessionUser.studentId ?? storeUser.studentId,
  };
}
