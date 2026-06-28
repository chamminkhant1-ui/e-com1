import { Navigate, Outlet } from 'react-router-dom';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { getAuthenticatedHomePath } from '@/routes/authPaths';
import type { Role } from '@/types/auth.d.ts';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-10 h-10 border-4 border-primary-container border-t-transparent rounded-full animate-spin' />
          <p className='text-on-surface-variant text-sm font-medium tracking-wide'>
            loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to='/' replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getAuthenticatedHomePath(user)} replace />;
  }

  return <Outlet />;
};
