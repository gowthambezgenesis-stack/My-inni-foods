import React, { useState } from 'react';
import { OrderStatus } from '../../types';
import { ADMIN_FULFILLMENT_STATUSES, formatOrderStatusLabel, ORDER_STATUS_LABELS } from '../../lib/orderStatuses';
import { canManageOrders } from '../../lib/adminRoles';
import { useAuthStore } from '../../store/authStore';

const ADMIN_STATUS_OPTIONS = ADMIN_FULFILLMENT_STATUSES;

function resolveAdminSelectStatus(status: OrderStatus): OrderStatus {
  return ADMIN_FULFILLMENT_STATUSES.includes(status) ? status : 'processing';
}

interface StatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
  onUpdate: (id: string, status: OrderStatus) => Promise<void>;
}

/** Dropdown to update order fulfillment status — visible to order managers and super admins. */
export function StatusUpdater({ orderId, currentStatus, onUpdate }: StatusUpdaterProps) {
  const { role, isSuperAdmin } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const canUpdate = isSuperAdmin || canManageOrders(role);

  if (!canUpdate) {
    return (
      <span className="text-sm text-neutral-400">{formatOrderStatusLabel(currentStatus)}</span>
    );
  }

  const selectValue = resolveAdminSelectStatus(currentStatus);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      await onUpdate(orderId, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={selectValue}
      onChange={handleChange}
      disabled={isUpdating}
      className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 disabled:opacity-50"
    >
      {ADMIN_STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {ORDER_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
