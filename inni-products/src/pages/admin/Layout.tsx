import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminTopbar } from '../../components/admin/AdminTopbar';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <AdminTopbar />
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
