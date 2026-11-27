import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAppSelector } from '../../hooks/useRedux';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function PermissionGuard({
  permission,
  children,
}: {
  permission: string | string[];
  children: ReactNode;
}) {
  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.permissions || [];
  const required = Array.isArray(permission) ? permission : [permission];

  if (user?.role === 'super_admin' || required.some((p) => permissions.includes(p))) {
    return <>{children}</>;
  }

  toast.error('دسترسی به این بخش وجود ندارد');
  return <Navigate to="/dashboard" replace />;
}
