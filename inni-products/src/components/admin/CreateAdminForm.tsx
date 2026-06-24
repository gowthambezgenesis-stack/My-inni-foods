import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createAdmin } from '../../features/admin/adminApi';
import { CREATABLE_ADMIN_ROLES, DEFAULT_CREATABLE_ADMIN_ROLE } from '../../lib/adminRoles';
import { cn } from '../../lib/utils';

interface CreateAdminFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateAdminForm({ onSuccess, onCancel }: CreateAdminFormProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(DEFAULT_CREATABLE_ADMIN_ROLE);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createAdmin({
        email: trimmedEmail,
        role,
        full_name: fullName.trim() || undefined,
      });
      setSuccess(response.message);
      toast.success(response.message);
      setEmail('');
      setFullName('');
      setRole(DEFAULT_CREATABLE_ADMIN_ROLE);
      onSuccess?.();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      let message = 'Failed to create admin. Please try again.';
      if (data) {
        if (typeof data.error === 'string') {
          message = data.error;
        } else if (typeof data.email === 'object' && Array.isArray(data.email)) {
          message = String(data.email[0]);
        } else if (typeof data.role === 'object' && Array.isArray(data.role)) {
          message = String(data.role[0]);
        }
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="drawer-admin-email" className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
          Email address
        </label>
        <input
          id="drawer-admin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@inni.com"
          disabled={isSubmitting}
          className={cn(
            'w-full bg-[#111] border rounded-xl px-4 py-3 outline-none transition-colors text-white placeholder-neutral-500',
            error ? 'border-red-500/60 focus:border-red-400' : 'border-white/10 focus:border-orange-500/60',
          )}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="drawer-admin-full-name" className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
          Full name <span className="text-neutral-600 normal-case">(optional)</span>
        </label>
        <input
          id="drawer-admin-full-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Jane Doe"
          disabled={isSubmitting}
          className="w-full bg-[#111] border border-white/10 focus:border-orange-500/60 rounded-xl px-4 py-3 outline-none transition-colors text-white placeholder-neutral-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="drawer-admin-role" className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
          Role
        </label>
        <select
          id="drawer-admin-role"
          value={role}
          onChange={(event) => setRole(event.target.value as typeof role)}
          disabled={isSubmitting}
          className="w-full bg-[#111] border border-white/10 focus:border-orange-500/60 rounded-xl px-4 py-3 outline-none transition-colors text-white"
        >
          {CREATABLE_ADMIN_ROLES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-4 py-3">
          {success}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-full font-medium text-sm border border-white/10 text-neutral-300 hover:bg-white/[0.04] transition-colors disabled:opacity-60 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-white text-black rounded-full py-3 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Creating...' : 'Create Admin'}
        </button>
      </div>
    </form>
  );
}
