import React, { useEffect, useState } from 'react';
import { Loader2, Shield, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { CreateAdminDrawer } from '../../components/admin/CreateAdminDrawer';
import { AdminUser, fetchAdminUsers, removeAdminUser, updateUserRole } from '../../features/admin/adminApi';
import { ADMIN_ROLES, formatRoleLabel, isAdminUserActive } from '../../lib/adminRoles';
import { useAuthStore } from '../../store/authStore';

export function Users() {
  const { user: currentUser, isSuperAdmin } = useAuthStore();
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

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Shield className="text-orange-500" size={28} />
              Users & Admins
            </h2>
            <p className="text-neutral-400 mt-1">Manage admin team access and roles.</p>
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
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950 border border-white/[0.08] rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-orange-500 max-w-xs"
          >
            <option value="">All Roles</option>
            {ADMIN_ROLES.map((role) => (
              <option key={role} value={role}>
                {formatRoleLabel(role)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-neutral-400 text-sm">Loading users...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-400 text-sm">
            {error}
          </div>
        ) : (
          <div className="bg-neutral-950 border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-neutral-900/50">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">User</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Email</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Role</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Status</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Last Login</th>
                    {isSuperAdmin && (
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400 text-right">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {users.map((user) => {
                    const isActive = isAdminUserActive(user);

                    return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-medium text-white">{user.full_name || user.username}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">ID: {user.id}</p>
                      </td>
                      <td className="p-4 text-sm text-neutral-300">{user.email}</td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          disabled={updatingId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-neutral-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 disabled:opacity-50"
                        >
                          {ADMIN_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {formatRoleLabel(role)}
                            </option>
                          ))}
                        </select>
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
                      <td className="p-4 text-xs text-neutral-500 font-mono">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString('en-IN') : '—'}
                      </td>
                      {isSuperAdmin && (
                        <td className="p-4 text-right">
                          {currentUserId === user.id ? (
                            <span className="text-xs text-neutral-500">You</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemove(user)}
                              disabled={removingId === user.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200 disabled:opacity-50 cursor-pointer"
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
              <p className="p-8 text-center text-sm text-neutral-500">No users found.</p>
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
