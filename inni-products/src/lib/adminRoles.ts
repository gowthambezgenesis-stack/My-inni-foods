import type { User } from '../types';

export type AdminRole = NonNullable<User['role']>;

export const ADMIN_PANEL_ROLES: AdminRole[] = [
  'super_admin',
  'order_manager',
  'support_agent',
  'viewer',
];

export const CREATABLE_ADMIN_ROLES: Array<{ value: AdminRole; label: string }> = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'order_manager', label: 'Order Manager' },
  { value: 'support_agent', label: 'Support Agent' },
  { value: 'viewer', label: 'Viewer' },
];

export const ADMIN_ROLES: AdminRole[] = CREATABLE_ADMIN_ROLES.map((option) => option.value);

export const DEFAULT_CREATABLE_ADMIN_ROLE: AdminRole = 'order_manager';

export function isAdminUserActive(user: {
  is_active: boolean;
  is_profile_active: boolean | null;
}): boolean {
  return user.is_active && user.is_profile_active !== false;
}

export function formatRoleLabel(role: string | null | undefined): string {
  if (!role) return 'Admin';
  return role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function canAccessOrders(role: AdminRole | null | undefined): boolean {
  return role === 'super_admin' || role === 'order_manager' || role === 'support_agent' || role === 'viewer';
}

export function canManageOrders(role: AdminRole | null | undefined): boolean {
  return role === 'super_admin' || role === 'order_manager';
}

export function canManageUsers(role: AdminRole | null | undefined): boolean {
  return role === 'super_admin';
}

export function canViewRevenue(role: AdminRole | null | undefined): boolean {
  return role === 'super_admin' || role === 'order_manager';
}

interface AdminMenuItem {
  name: string;
  path: string;
  icon: 'dashboard' | 'orders' | 'users' | 'settings';
}

export function getAdminMenuItems(role: AdminRole | null | undefined, isSuperAdmin: boolean): AdminMenuItem[] {
  const items: AdminMenuItem[] = [{ name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' }];

  if (canAccessOrders(role) || isSuperAdmin) {
    items.push({ name: 'Orders', path: '/admin/orders', icon: 'orders' });
  }

  if (canManageUsers(role) || isSuperAdmin) {
    items.push({ name: 'Users', path: '/admin/users', icon: 'users' });
  }

  if (isSuperAdmin) {
    items.push({ name: 'Settings', path: '/admin/settings', icon: 'settings' });
  }

  return items;
}
