import React, { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminTopbar } from '../../components/admin/AdminTopbar';
import { useAdminOrderNotifications } from '../../hooks/useAdminOrderNotifications';
import { useAdminThemeClasses } from '../../lib/adminTheme';
import { cn } from '../../lib/utils';

export function AdminLayout() {
  useAdminOrderNotifications();
  const t = useAdminThemeClasses();
  const contentScrollRef = useRef<HTMLElement>(null);

  return (
    <div className={cn('min-h-screen h-screen flex overflow-hidden', t.shell)}>
      <AdminSidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar scrollContainerRef={contentScrollRef} />
        <main ref={contentScrollRef} className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
