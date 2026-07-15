import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2 } from 'lucide-react';
import { OrderStatus } from '../../types';
import {
  ADMIN_FULFILLMENT_STATUSES,
  formatOrderStatusLabel,
  ORDER_STATUS_LABELS,
} from '../../lib/orderStatuses';
import { canManageOrders } from '../../lib/adminRoles';
import { useAdminThemeStore } from '../../store/adminThemeStore';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const ADMIN_STATUS_OPTIONS = ADMIN_FULFILLMENT_STATUSES;

function resolveAdminSelectStatus(status: OrderStatus): OrderStatus {
  if (ADMIN_FULFILLMENT_STATUSES.includes(status)) {
    return status;
  }
  // pending / unknown statuses stay selectable via the closest editable state
  return 'processing';
}

function RadioIndicator({ selected, isDark }: { selected: boolean; isDark: boolean }) {
  return (
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        selected
          ? 'border-orange-500'
          : isDark
            ? 'border-white/15'
            : 'border-neutral-300',
      )}
      aria-hidden
    >
      {selected && <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
    </span>
  );
}

interface StatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
  onUpdate: (id: string, status: OrderStatus) => Promise<void>;
  /** When true, status cannot be changed (All Orders archived scope). */
  readOnly?: boolean;
}

/** Custom pill dropdown to update order fulfillment status. */
export function StatusUpdater({
  orderId,
  currentStatus,
  onUpdate,
  readOnly = false,
}: StatusUpdaterProps) {
  const { role, isSuperAdmin } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isDark = useAdminThemeStore((state) => state.theme) === 'dark';

  const canUpdate = !readOnly && (isSuperAdmin || canManageOrders(role));
  const displayStatus = resolveAdminSelectStatus(currentStatus);
  const buttonLabel = ORDER_STATUS_LABELS[currentStatus] ?? formatOrderStatusLabel(currentStatus);

  const updateMenuPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 100,
    });
  };

  useEffect(() => {
    if (!open) return undefined;

    updateMenuPosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const handleReposition = () => updateMenuPosition();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open]);

  if (!canUpdate) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium',
          isDark ? 'border-white/10 bg-neutral-900 text-white' : 'border-neutral-200 bg-white text-neutral-900',
          readOnly && 'opacity-80',
        )}
        title={readOnly ? 'Status is locked for Order History' : undefined}
      >
        {formatOrderStatusLabel(currentStatus)}
      </span>
    );
  }

  const handleSelect = async (newStatus: OrderStatus) => {
    setOpen(false);
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);
    try {
      await onUpdate(orderId, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const dropdownMenu = open ? (
    <div
      ref={menuRef}
      role="listbox"
      aria-label="Fulfillment status options"
      style={menuStyle}
      className={cn(
        'overflow-hidden rounded-2xl p-1.5 shadow-xl shadow-black/30',
        isDark ? 'bg-neutral-800/98 border border-white/[0.08]' : 'bg-neutral-100 border border-neutral-200/80',
      )}
    >
      {ADMIN_STATUS_OPTIONS.map((status) => {
        const isSelected =
          status === currentStatus ||
          (status === displayStatus && !ADMIN_FULFILLMENT_STATUSES.includes(currentStatus));

        return (
          <button
            key={status}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => handleSelect(status)}
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium',
              'transition-all duration-150 cursor-pointer',
              isSelected
                ? isDark
                  ? 'bg-neutral-700/90 text-white'
                  : 'bg-white text-neutral-900 shadow-sm'
                : isDark
                  ? 'text-neutral-300 hover:bg-white/[0.04]'
                  : 'text-neutral-700 hover:bg-white/60',
            )}
          >
            <span>{ORDER_STATUS_LABELS[status]}</span>
            <RadioIndicator selected={isSelected} isDark={isDark} />
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="relative min-w-[13.5rem]">
      <button
        type="button"
        onClick={() => !isUpdating && setOpen((value) => !value)}
        disabled={isUpdating}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Fulfillment status"
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-full border px-4 py-2.5 text-sm font-medium',
          'transition-all duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-orange-500/20',
          'disabled:cursor-not-allowed disabled:opacity-60',
          isDark
            ? 'border-white/10 bg-neutral-900 text-white hover:border-white/20'
            : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 shadow-sm',
          open && (isDark ? 'border-white/25 ring-2 ring-white/5' : 'border-neutral-300 ring-2 ring-neutral-100'),
        )}
      >
        <span className="truncate">{buttonLabel}</span>
        {isUpdating ? (
          <Loader2 size={16} className="shrink-0 animate-spin text-orange-400" />
        ) : (
          <ChevronDown
            size={16}
            className={cn(
              'shrink-0 transition-transform duration-200',
              isDark ? 'text-neutral-400' : 'text-neutral-500',
              open && 'rotate-180',
            )}
          />
        )}
      </button>

      {dropdownMenu && createPortal(dropdownMenu, document.body)}
    </div>
  );
}
