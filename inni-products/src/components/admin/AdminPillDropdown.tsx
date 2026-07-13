import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { useAdminThemeStore } from '../../store/adminThemeStore';
import { cn } from '../../lib/utils';

export interface PillDropdownOption {
  value: string;
  label: string;
}

interface AdminPillDropdownProps {
  value: string;
  options: PillDropdownOption[];
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
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

export function AdminPillDropdown({
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: AdminPillDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isDark = useAdminThemeStore((state) => state.theme) === 'dark';

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

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

  const dropdownMenu = open ? (
    <div
      ref={menuRef}
      role="listbox"
      aria-label={ariaLabel}
      style={menuStyle}
      className={cn(
        'overflow-hidden rounded-2xl p-1.5 shadow-xl shadow-black/30',
        isDark ? 'bg-neutral-800/98 border border-white/[0.08]' : 'bg-neutral-100 border border-neutral-200/80',
      )}
    >
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
            <span>{option.label}</span>
            <RadioIndicator selected={isSelected} isDark={isDark} />
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={cn('relative min-w-[10.5rem]', className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-full border px-4 py-2.5 text-sm font-medium',
          'transition-all duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-orange-500/20',
          isDark
            ? 'border-white/10 bg-neutral-900 text-white hover:border-white/20'
            : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 shadow-sm',
          open && (isDark ? 'border-white/25 ring-2 ring-white/5' : 'border-neutral-300 ring-2 ring-neutral-100'),
          !selectedOption && (isDark ? 'text-neutral-400' : 'text-neutral-500'),
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 transition-transform duration-200',
            isDark ? 'text-neutral-400' : 'text-neutral-500',
            open && 'rotate-180',
          )}
        />
      </button>

      {dropdownMenu && createPortal(dropdownMenu, document.body)}
    </div>
  );
}
