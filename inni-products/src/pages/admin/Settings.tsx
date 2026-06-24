import React from 'react';
import { Settings } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="text-orange-500" size={28} />
          Settings
        </h2>
        <p className="text-neutral-400 mt-1">Configure store and admin preferences.</p>
      </div>

      <div className="bg-neutral-950 border border-white/[0.08] rounded-xl p-8 max-w-2xl">
        <h3 className="text-lg font-semibold text-white mb-2">Store Configuration</h3>
        <p className="text-sm text-neutral-400 mb-6">
          Settings panel coming soon. Razorpay keys are managed via backend <code className="text-orange-400">.env</code>.
        </p>
        <div className="space-y-4 text-sm text-neutral-300">
          <div className="flex justify-between py-3 border-b border-white/[0.06]">
            <span>Payment Gateway</span>
            <span className="text-emerald-400 font-mono">Razorpay</span>
          </div>
          <div className="flex justify-between py-3 border-b border-white/[0.06]">
            <span>Product Catalog</span>
            <span className="text-neutral-500">Frontend JSON (data.ts)</span>
          </div>
          <div className="flex justify-between py-3">
            <span>Admin Access</span>
            <span className="text-orange-400">Super Admin Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
