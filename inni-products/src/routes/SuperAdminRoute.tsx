import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface SuperAdminRouteProps {
  children: ReactNode;
}

function AdminRouteLoading() {
  return (
    <div className="py-12 text-center text-sm text-neutral-400">Loading admin session...</div>
  );
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { hasHydrated, isSuperAdmin } = useAuthStore();

  if (!hasHydrated) {
    return <AdminRouteLoading />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
