import React, { useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '../../lib/utils';
import { ADMIN_OTP_LENGTH } from '../../lib/adminLoginSession';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({ value, onChange, disabled = false, error = false }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(ADMIN_OTP_LENGTH, ' ').split('').slice(0, ADMIN_OTP_LENGTH);

  useEffect(() => {
    if (!disabled) {
      inputsRef.current[0]?.focus();
    }
  }, [disabled]);

  const updateValue = (index: number, digit: string) => {
    const next = value.split('');
    next[index] = digit;
    onChange(next.join('').replace(/\s/g, '').slice(0, ADMIN_OTP_LENGTH));
  };

  const handleChange = (index: number, inputValue: string) => {
    const digit = inputValue.replace(/\D/g, '').slice(-1);
    if (!digit) return;

    updateValue(index, digit);

    if (index < ADMIN_OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();

      if (digits[index]?.trim()) {
        updateValue(index, '');
        return;
      }

      if (index > 0) {
        updateValue(index - 1, '');
        inputsRef.current[index - 1]?.focus();
      }
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < ADMIN_OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, ADMIN_OTP_LENGTH);
    if (!pasted) return;

    onChange(pasted);

    const focusIndex = Math.min(pasted.length, ADMIN_OTP_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length: ADMIN_OTP_LENGTH }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={1}
          disabled={disabled}
          value={digits[index]?.trim() || ''}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1} of ${ADMIN_OTP_LENGTH}`}
          className={cn(
            'w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold bg-[#111] border rounded-xl outline-none transition-colors text-white',
            error
              ? 'border-red-500/60 focus:border-red-400'
              : 'border-white/10 focus:border-orange-500/60',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      ))}
    </div>
  );
}
