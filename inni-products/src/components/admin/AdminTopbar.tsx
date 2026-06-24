import React from 'react';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { formatRoleLabel } from '../../lib/adminRoles';

export function AdminTopbar() {
  const { user, role, isSuperAdmin } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/[0.08] px-6 py-4 mb-8 -mx-8 -mt-8">
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          className="p-2 rounded-lg border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">{user?.email}</p>
          <p className="text-[10px] text-orange-400 uppercase tracking-widest font-mono">
            {isSuperAdmin ? 'Super Admin' : formatRoleLabel(role ?? undefined)}
          </p>
        </div>
      </div>
    </header>
  );
}
