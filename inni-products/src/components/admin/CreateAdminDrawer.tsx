import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, UserPlus } from 'lucide-react';
import { CreateAdminForm } from './CreateAdminForm';

interface CreateAdminDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateAdminDrawer({ open, onClose, onSuccess }: CreateAdminDrawerProps) {
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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-admin-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-neutral-950 border-l border-white/[0.08] shadow-2xl flex flex-col"
          >
            <div className="flex items-start justify-between gap-4 px-6 py-6 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <UserPlus className="text-orange-500" size={22} />
                  <h2 id="create-admin-drawer-title" className="text-xl font-semibold text-white">
                    Create Admin
                  </h2>
                </div>
                <p className="text-sm text-neutral-400">
                  Add a team member. They can sign in with OTP using their email.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
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
