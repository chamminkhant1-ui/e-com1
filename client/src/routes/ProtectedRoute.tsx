import { Navigate, Outlet } from 'react-router-dom';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { getAuthenticatedHomePath } from '@/routes/authPaths';
import type { Role } from '@/types/auth.d.ts';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthUser();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to='/' replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getAuthenticatedHomePath(user)} replace />;
  }

  return <Outlet />;
};
