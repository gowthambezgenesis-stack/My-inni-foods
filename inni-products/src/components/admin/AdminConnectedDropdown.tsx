import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAdminThemeStore } from '../../store/adminThemeStore';
import { cn } from '../../lib/utils';

export interface ConnectedDropdownOption {
  value: string;
  label: string;
}

interface AdminConnectedDropdownProps {
  id?: string;
  value: string;
  options: ConnectedDropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel: string;
}

export function AdminConnectedDropdown({
  id,
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
}: AdminConnectedDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = useAdminThemeStore((state) => state.theme) === 'dark';

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelect = (nextValue: string) => {
    setOpen(false);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          'overflow-hidden rounded-xl border transition-colors',
          isDark
            ? 'border-orange-500/25 bg-neutral-900'
            : 'border-violet-300/80 bg-white shadow-sm',
          open && (isDark ? 'border-orange-500/40' : 'border-violet-400'),
          disabled && 'opacity-60 pointer-events-none',
        )}
      >
        <button
          id={id}
          type="button"
          onClick={() => setOpen((current) => !current)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={cn(
            'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium',
            'transition-colors cursor-pointer focus:outline-none',
            open && (isDark ? 'border-b border-white/[0.08]' : 'border-b border-violet-200/80'),
            isDark ? 'text-white' : 'text-neutral-800',
          )}
        >
          <span className="truncate">{selectedOption?.label ?? 'Select'}</span>
          <ChevronDown
            size={16}
            className={cn(
              'shrink-0 transition-transform duration-200',
              isDark ? 'text-neutral-400' : 'text-neutral-600',
              open && 'rotate-180',
            )}
          />
        </button>

        {open && (
          <div
            role="listbox"
            aria-label={ariaLabel}
            className="max-h-52 overflow-y-auto"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'flex w-full px-4 py-3 text-left text-sm font-medium transition-colors cursor-pointer',
                    isSelected
                      ? isDark
                        ? 'bg-orange-500/12 text-white'
                        : 'bg-violet-100/90 text-neutral-900'
                      : isDark
                        ? 'text-neutral-300 hover:bg-white/[0.04]'
                        : 'text-neutral-700 hover:bg-violet-50',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
