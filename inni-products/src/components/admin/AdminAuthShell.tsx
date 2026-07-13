import React from 'react';
import { motion } from 'motion/react';
import { LayoutPanelLeft } from 'lucide-react';

interface AdminAuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AdminAuthShell({ title, subtitle, children }: AdminAuthShellProps) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#111112] rounded-[2rem] p-8 md:p-10 border border-white/[0.05] shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
              <LayoutPanelLeft className="text-orange-500 w-6 h-6" />
            </div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-2">
              INNI Console
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2">
              {title}
            </h1>
            <p className="text-sm text-neutral-400 font-light">{subtitle}</p>
          </div>

          {children}
        </div>
      </motion.div>
    </div>
  );
}
