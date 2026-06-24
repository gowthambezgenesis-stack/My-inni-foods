import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { formatRoleLabel, getAdminMenuItems } from '../../lib/adminRoles';
import { cn } from '../../lib/utils';

const ICONS = {
  dashboard: LayoutDashboard,
  orders: ShoppingCart,
  users: Users,
  settings: Settings,
};

export function AdminSidebar() {
  const { user, logout, isSuperAdmin, role } = useAuthStore();
  const navigate = useNavigate();
  const menuItems = getAdminMenuItems(role, isSuperAdmin);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-neutral-950 border-r border-white/[0.08] flex flex-col justify-between py-6 px-4 shrink-0">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 px-3">
          <ShieldAlert className="text-orange-500 w-6 h-6" />
          <div>
            <h1 className="font-semibold text-lg leading-tight text-white tracking-tight">inni admin</h1>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
              {formatRoleLabel(role ?? 'admin')}
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/10 text-white font-semibold border border-white/10'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]',
                  )
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/[0.08] pt-6 flex flex-col gap-4">
        {user && (
          <div className="px-3 flex flex-col">
            <span className="text-xs font-semibold text-neutral-200 truncate">{user.email}</span>
            <span className="text-[10px] text-orange-400/80 mt-0.5 uppercase tracking-wider font-mono">
              {isSuperAdmin ? 'Full Access' : formatRoleLabel(role ?? undefined)}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200 w-full cursor-pointer text-left"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
