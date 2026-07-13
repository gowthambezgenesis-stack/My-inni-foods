import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  LogOut,
  LayoutPanelLeft,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getAdminMenuItems } from '../../lib/adminRoles';
import { useAdminThemeClasses } from '../../lib/adminTheme';
import { cn } from '../../lib/utils';

const ICONS = {
  dashboard: LayoutDashboard,
  orders: ShoppingCart,
  users: Users,
};

export function AdminSidebar() {
  const { logout, isSuperAdmin, role } = useAuthStore();
  const navigate = useNavigate();
  const menuItems = getAdminMenuItems(role, isSuperAdmin);
  const t = useAdminThemeClasses();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!confirmOpen) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSigningOut) {
        setConfirmOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [confirmOpen, isSigningOut]);

  const handleConfirmLogout = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      navigate('/admin/login');
    } finally {
      setIsSigningOut(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <aside className={cn('w-64 min-h-screen border-r flex flex-col justify-between py-6 px-4 shrink-0', t.sidebar)}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20">
              <LayoutPanelLeft className="text-orange-500 w-5 h-5" />
            </div>
            <div>
              <h1 className={cn('font-semibold text-lg leading-tight tracking-tight', t.heading)}>
                INNI <span className="font-bold">Console</span>
              </h1>
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
                      isActive ? t.navActive : t.navInactive,
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

        <div className={cn('border-t pt-6', t.border)}>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200 w-full cursor-pointer text-left"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close sign out confirmation"
            onClick={() => !isSigningOut && setConfirmOpen(false)}
            className={cn('absolute inset-0 cursor-pointer', t.overlay)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-out-title"
            className={cn(
              'relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl',
              t.dropdown,
            )}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <LogOut size={18} />
              </div>
              <div>
                <h2 id="sign-out-title" className={cn('text-base font-semibold', t.heading)}>
                  Sign out?
                </h2>
                <p className={cn('mt-1 text-sm', t.body)}>
                  Are you sure you want to sign out of the admin dashboard?
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={isSigningOut}
                className="flex-1 py-2.5 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isSigningOut}
                className={cn(
                  'flex-1 py-2.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-60 cursor-pointer',
                  t.cancelBtn,
                )}
              >
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
