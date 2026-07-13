import React, { useEffect, useState } from 'react';
import { Loader2, Shield, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { CreateAdminDrawer } from '../../components/admin/CreateAdminDrawer';
import { AdminOutlinedDropdown } from '../../components/admin/AdminOutlinedDropdown';
import { AdminUser, fetchAdminUsers, removeAdminUser, updateUserRole } from '../../features/admin/adminApi';
import { ADMIN_ROLES, formatRoleLabel, isAdminUserActive } from '../../lib/adminRoles';
import { useAdminThemeClasses } from '../../lib/adminTheme';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

export function Users() {
  const { user: currentUser, isSuperAdmin } = useAuthStore();
  const t = useAdminThemeClasses();
  const currentUserId = currentUser?.id ? Number(currentUser.id) : null;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await fetchAdminUsers({
        role: roleFilter || undefined,
      });
      setUsers(data);
      setError(null);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (userId: number, role: string) => {
    setUpdatingId(userId);
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success('Role updated successfully');
    } catch {
      toast.error('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (admin: AdminUser) => {
    const confirmed = window.confirm(
      `Remove ${admin.full_name || admin.email} from the admin team? They will lose access to the admin dashboard.`,
    );
    if (!confirmed) {
      return;
    }

    setRemovingId(admin.id);
    try {
      await removeAdminUser(admin.id);
      setUsers((prev) => prev.filter((u) => u.id !== admin.id));
      toast.success('Admin removed successfully');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to remove admin';
      toast.error(message);
    } finally {
      setRemovingId(null);
    }
  };

  const roleOptions = ADMIN_ROLES.map((role) => ({
    value: role,
    label: formatRoleLabel(role),
  }));

  const roleFilterOptions = [
    { value: '', label: 'All Roles' },
    ...roleOptions,
  ];

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className={cn('text-3xl font-bold tracking-tight flex items-center gap-2', t.heading)}>
              <Shield className="text-orange-500" size={28} />
              Users & Admins
            </h2>
            <p className={cn('mt-1', t.body)}>Manage admin team access and roles.</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <UserPlus size={16} />
            Create Admin
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <AdminOutlinedDropdown
            value={roleFilter}
            options={roleFilterOptions}
            onChange={setRoleFilter}
            ariaLabel="Filter users by role"
            className="max-w-xs w-full sm:w-56"
          />
        </div>

        {loading ? (
          <div className={cn('text-center py-12 text-sm', t.loading)}>Loading users...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-400 text-sm">
            {error}
          </div>
        ) : (
          <div className={cn('border rounded-xl overflow-hidden', t.surface)}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={cn('border-b', t.border, t.surfaceMuted)}>
                    <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider', t.label)}>User</th>
                    <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider', t.label)}>Email</th>
                    <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider', t.label)}>Role</th>
                    <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider', t.label)}>Status</th>
                    {isSuperAdmin && (
                      <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider text-right', t.label)}>
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className={cn('divide-y', t.divide)}>
                  {users.map((user) => {
                    const isActive = isAdminUserActive(user);

                    return (
                    <tr key={user.id} className={cn('transition-colors', t.rowHover)}>
                      <td className="p-4">
                        <p className={cn('text-sm font-medium', t.heading)}>{user.full_name || user.username}</p>
                        <p className={cn('text-[10px] font-mono', t.muted)}>ID: {user.id}</p>
                      </td>
                      <td className={cn('p-4 text-sm', t.bodyStrong)}>{user.email}</td>
                      <td className="p-4">
                        <AdminOutlinedDropdown
                          value={user.role}
                          options={roleOptions}
                          onChange={(role) => handleRoleChange(user.id, role)}
                          disabled={updatingId === user.id}
                          loading={updatingId === user.id}
                          ariaLabel={`Change role for ${user.email}`}
                          size="sm"
                          className="min-w-[10.5rem]"
                        />
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-medium ${
                            isActive ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td className="p-4 text-right">
                          {currentUserId === user.id ? (
                            <span className={cn('text-xs', t.muted)}>You</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemove(user)}
                              disabled={removingId === user.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-600 hover:border-red-500/40 disabled:opacity-50 cursor-pointer"
                            >
                              {removingId === user.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <p className={cn('p-8 text-center text-sm', t.muted)}>No users found.</p>
            )}
          </div>
        )}
      </div>

      <CreateAdminDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSuccess={loadUsers}
      />
    </>
  );
}

export default Users;
