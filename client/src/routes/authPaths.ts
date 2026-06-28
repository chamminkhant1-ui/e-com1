import type { User } from '@/types/auth';

/**
 * Default route after auth for users who should not see the login page.
 *
 * Kept generic here: every role lands on /dashboard. Introduce role- or
 * profile-specific paths later as you build out those routes.
 */
export function getAuthenticatedHomePath(_user: User): string {
  return '/dashboard';
}
