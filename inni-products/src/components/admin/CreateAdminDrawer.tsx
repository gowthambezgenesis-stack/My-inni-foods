import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, UserPlus } from 'lucide-react';
import { CreateAdminForm } from './CreateAdminForm';
import { useAdminThemeClasses } from '../../lib/adminTheme';
import { cn } from '../../lib/utils';

interface CreateAdminDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateAdminDrawer({ open, onClose, onSuccess }: CreateAdminDrawerProps) {
  const t = useAdminThemeClasses();

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close create admin panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className={cn('fixed inset-0 z-40 backdrop-blur-sm cursor-pointer', t.overlay)}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-admin-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={cn('fixed top-0 right-0 z-50 h-full w-full max-w-md border-l shadow-2xl flex flex-col', t.drawer)}
          >
            <div className={cn('flex items-start justify-between gap-4 px-6 py-6 border-b', t.border)}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <UserPlus className="text-orange-500" size={22} />
                  <h2 id="create-admin-drawer-title" className={cn('text-xl font-semibold', t.heading)}>
                    Create Admin
                  </h2>
                </div>
                <p className={cn('text-sm', t.body)}>
                  Add a team member. They can sign in with OTP using their email.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={cn('p-2 rounded-lg transition-colors cursor-pointer', t.iconClose)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <CreateAdminForm onSuccess={handleSuccess} onCancel={onClose} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
