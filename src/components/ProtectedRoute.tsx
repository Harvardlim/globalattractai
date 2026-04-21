import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { MobileOnlyGuard } from './MobileOnlyGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowDesktop?: boolean;
}

export function ProtectedRoute({ children, allowDesktop }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Redirect to force change password if needed (but not if already on that page)
  if (profile?.must_change_password && location.pathname !== '/force-change-password') {
    return <Navigate to="/force-change-password" replace />;
  }

  return (
    <MobileOnlyGuard allowDesktop={allowDesktop}>
      {children}
    </MobileOnlyGuard>
  );
}
