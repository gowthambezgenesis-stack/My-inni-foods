import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ADMIN_PANEL_ROLES } from '../lib/adminRoles';
import { useAdminThemeClasses } from '../lib/adminTheme';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

interface ProtectedRouteProps {
  allowedRoles?: Array<'super_admin' | 'order_manager' | 'support_agent'>;
  requireSuperAdmin?: boolean;
  children?: React.ReactNode;
}

function AdminRouteLoading() {
  const t = useAdminThemeClasses();

  return (
    <div className={cn('min-h-screen flex items-center justify-center', t.shell)}>
      <p className={cn('text-sm', t.loading)}>Loading admin session...</p>
    </div>
  );
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requireSuperAdmin = false,
  children,
}) => {
  const location = useLocation();
  const { hasHydrated, isAuthenticated, isSuperAdmin, role, user } = useAuthStore();

  if (!hasHydrated) {
    return <AdminRouteLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (requireSuperAdmin && !isSuperAdmin && !user?.is_super_admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export function isAdminPanelRole(role: string | null | undefined): role is (typeof ADMIN_PANEL_ROLES)[number] {
  return Boolean(role && ADMIN_PANEL_ROLES.includes(role as (typeof ADMIN_PANEL_ROLES)[number]));
}
