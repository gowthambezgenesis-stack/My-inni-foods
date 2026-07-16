import React, { useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { ArrowRight, Mail } from 'lucide-react';

import { AdminAuthShell } from '../../components/admin/AdminAuthShell';

import { setAdminLoginSession, setAdminLoginRedirect } from '../../lib/adminLoginSession';

import { sendAdminOtp } from '../../features/admin/adminApi';

import { useAuthStore } from '../../store/authStore';

import { isAdminPanelRole } from '../../routes/ProtectedRoute';

import { cn } from '../../lib/utils';



export function AdminLogin() {

  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, role, hasHydrated } = useAuthStore();

  const [email, setEmail] = useState('');

  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);



  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const redirectFrom =
      typeof location.state?.from === 'string' && location.state.from.startsWith('/admin')
        ? location.state.from
        : null;
    if (redirectFrom) {
      setAdminLoginRedirect(redirectFrom);
    }

    if (isAuthenticated && isAdminPanelRole(role)) {
      navigate(redirectFrom ?? '/admin/dashboard', { replace: true });
    }
  }, [hasHydrated, isAuthenticated, role, location.state, navigate]);



  const handleSubmit = async (event: React.FormEvent) => {

    event.preventDefault();

    setError('');



    const trimmedEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



    if (!trimmedEmail) {

      setError('Please enter your admin email address.');

      return;

    }



    if (!emailPattern.test(trimmedEmail)) {

      setError('Please enter a valid email address.');

      return;

    }



    setIsSubmitting(true);



    try {
      const response = await sendAdminOtp(trimmedEmail);
      setAdminLoginSession(trimmedEmail);
      toast.success(response.message, { id: 'admin-otp-send' });
      navigate('/admin/login/verify');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'We couldn’t send your verification code right now. Please try again in a moment.';
      setError(message);
      toast.error(message, { id: 'admin-otp-send' });
    } finally {

      setIsSubmitting(false);

    }

  };



  return (

    <AdminAuthShell

      title="Admin sign in"

      subtitle="Enter your email to receive a one-time verification code."

    >

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="space-y-2">

          <label htmlFor="admin-email" className="text-xs font-medium text-neutral-400 uppercase tracking-wider">

            Email address

          </label>

          <div className="relative">

            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />

            <input

              id="admin-email"

              type="email"

              autoComplete="email"

              value={email}

              onChange={(event) => setEmail(event.target.value)}

              placeholder="admin@inni.com"

              disabled={isSubmitting}

              className={cn(

                'w-full bg-[#111] border rounded-xl pl-11 pr-4 py-3 outline-none transition-colors text-white placeholder-neutral-500',

                error ? 'border-red-500/60 focus:border-red-400' : 'border-white/10 focus:border-orange-500/60'

              )}

            />

          </div>

        </div>



        {error && (
          <p className="text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button

          type="submit"

          disabled={isSubmitting}

          className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-full py-3 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"

        >

          {isSubmitting ? 'Sending code...' : 'Continue'}

          {!isSubmitting && <ArrowRight size={18} />}

        </button>



        <p className="text-center text-xs text-neutral-500 font-light">

          A 6-digit code will be sent to your email if you are registered as an admin. It expires in 5 minutes.

        </p>

      </form>

    </AdminAuthShell>

  );

}



export default AdminLogin;

