import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useAdminThemeStore } from '../../store/adminThemeStore';
import { cn } from '../../lib/utils';

export interface OutlinedDropdownOption {
  value: string;
  label: string;
}

interface AdminOutlinedDropdownProps {
  id?: string;
  label?: string;
  value: string;
  options: OutlinedDropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function AdminOutlinedDropdown({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
  ariaLabel,
  className,
  size = 'md',
}: AdminOutlinedDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isDark = useAdminThemeStore((state) => state.theme) === 'dark';

  const selectedOption = options.find((option) => option.value === value);
  const isDisabled = disabled || loading;

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

  const handleSelect = (nextValue: string) => {
    setOpen(false);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const labelBg = isDark ? 'bg-neutral-950' : 'bg-white';
  const triggerPadding = size === 'sm' ? 'px-3 py-2' : 'px-4 py-2.5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const dropdownMenu = open ? (
    <div
      ref={menuRef}
      role="listbox"
      aria-label={ariaLabel}
      style={menuStyle}
      className={cn(
        'overflow-hidden rounded-xl border py-1 shadow-lg',
        isDark
          ? 'border-white/15 bg-neutral-900 shadow-black/40'
          : 'border-neutral-200 bg-white shadow-neutral-300/30',
      )}
    >
      <div className="max-h-52 overflow-y-auto">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value || '__all__'}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'flex w-full px-4 py-2.5 text-left font-medium transition-colors cursor-pointer',
                textSize,
                isSelected
                  ? isDark
                    ? 'bg-white/10 text-white'
                    : 'bg-neutral-100 text-neutral-900'
                  : isDark
                    ? 'text-neutral-300 hover:bg-white/[0.04]'
                    : 'text-neutral-700 hover:bg-neutral-50',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={cn('relative min-w-[9rem]', className)}>
      <div
        className={cn(
          'relative rounded-xl border transition-colors',
          isDark ? 'border-white/20 bg-neutral-900' : 'border-neutral-800/80 bg-white',
          open && (isDark ? 'border-white/35' : 'border-neutral-900'),
          isDisabled && 'opacity-60 pointer-events-none',
        )}
      >
        {label && (
          <span
            className={cn(
              'absolute -top-2 left-3 px-1 text-[11px] font-medium leading-none',
              labelBg,
              isDark ? 'text-neutral-400' : 'text-neutral-600',
            )}
          >
            {label}
          </span>
        )}

        <button
          id={id}
          type="button"
          onClick={() => !isDisabled && setOpen((current) => !current)}
          disabled={isDisabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={cn(
            'flex w-full items-center justify-between gap-2 text-left font-medium',
            'transition-colors cursor-pointer focus:outline-none',
            triggerPadding,
            textSize,
            isDark ? 'text-white' : 'text-neutral-900',
          )}
        >
          <span className="truncate">{selectedOption?.label ?? 'Select'}</span>
          {loading ? (
            <Loader2 size={14} className="shrink-0 animate-spin text-orange-400" />
          ) : (
            <ChevronDown
              size={14}
              className={cn(
                'shrink-0 transition-transform duration-200',
                isDark ? 'text-neutral-400' : 'text-neutral-700',
                open && 'rotate-180',
              )}
            />
          )}
        </button>
      </div>

      {dropdownMenu && createPortal(dropdownMenu, document.body)}
    </div>
  );
}
