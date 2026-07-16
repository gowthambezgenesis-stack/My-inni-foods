import React, { useEffect, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

import { AdminAuthShell } from '../../components/admin/AdminAuthShell';

import { OtpInput } from '../../components/admin/OtpInput';

import {

  clearAdminLoginSession,

  formatCountdown,

  getAdminLoginEmail,

  getAdminLoginRedirect,

  getRemainingSeconds,

  isOtpExpired,

  setAdminLoginSession,

} from '../../lib/adminLoginSession';

import { sendAdminOtp, verifyAdminOtp } from '../../features/admin/adminApi';

import { useAuthStore } from '../../store/authStore';

import { isAdminPanelRole } from '../../routes/ProtectedRoute';

import { cn } from '../../lib/utils';



function getApiErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (!data) return fallback;
  if (typeof data.error === 'string') return data.error;
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    if (typeof value === 'string') return value;
  }
  return fallback;
}



const OTP_LENGTH = 6;



export function AdminVerifyOtp() {

  const navigate = useNavigate();

  const { login, isAuthenticated, role, initialize } = useAuthStore();

  const [email, setEmail] = useState<string | null>(() => getAdminLoginEmail());

  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isResending, setIsResending] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(getRemainingSeconds);



  useEffect(() => {

    initialize();

  }, [initialize]);



  useEffect(() => {

    if (isAuthenticated && isAdminPanelRole(role)) {

      navigate('/admin/dashboard', { replace: true });

    }

  }, [isAuthenticated, role, navigate]);



  useEffect(() => {

    if (!email) {

      navigate('/admin/login', { replace: true });

    }

  }, [email, navigate]);



  useEffect(() => {

    if (!email) return;



    const tick = () => setRemainingSeconds(getRemainingSeconds());

    tick();

    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);

  }, [email]);



  if (!email) {

    return null;

  }



  const expired = isOtpExpired() || remainingSeconds === 0;



  const handleVerify = async (event: React.FormEvent) => {

    event.preventDefault();

    setError('');



    if (expired) {

      setError('This code has expired. Request a new one to continue.');

      return;

    }



    if (otp.length !== OTP_LENGTH) {

      setError(`Please enter the full ${OTP_LENGTH}-digit code.`);

      return;

    }



    setIsSubmitting(true);



    try {

      const auth = await verifyAdminOtp(email, otp);

      const redirectPath = getAdminLoginRedirect() ?? '/admin/dashboard';

      clearAdminLoginSession();

      login(auth.user, auth.access);

      navigate(redirectPath, { replace: true });

    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Invalid or expired verification code.'));
      setOtp('');

    } finally {

      setIsSubmitting(false);

    }

  };



  const handleResend = async () => {

    setError('');

    setIsResending(true);



    try {

      const response = await sendAdminOtp(email);
      setAdminLoginSession(email);
      setOtp('');
      setRemainingSeconds(getRemainingSeconds());
      toast.success(response.message, { id: 'admin-otp-resend' });
    } catch (err: unknown) {
      const message = getApiErrorMessage(
        err,
        'We couldn’t resend your code right now. Please try again in a moment.',
      );
      setError(message);
      toast.error(message, { id: 'admin-otp-resend' });
    } finally {

      setIsResending(false);

    }

  };



  return (

    <AdminAuthShell

      title="Verify your email"

      subtitle="Enter the 6-digit code sent to your email."

    >

      <form onSubmit={handleVerify} className="space-y-6">

        <div className="space-y-4">

          <OtpInput

            value={otp}

            onChange={setOtp}

            disabled={isSubmitting || expired}

            error={Boolean(error)}

          />



          <div className="flex items-center justify-between text-xs">

            <span className={cn('font-mono', expired ? 'text-red-400' : 'text-neutral-400')}>

              {expired ? 'Code expired' : `Expires in ${formatCountdown(remainingSeconds)}`}

            </span>

          </div>

        </div>



        {error && (

          <p className="text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl px-4 py-3">

            {error}

          </p>

        )}



        <button

          type="submit"

          disabled={isSubmitting || expired || otp.length !== OTP_LENGTH}

          className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-full py-3 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"

        >

          {isSubmitting ? 'Verifying...' : 'Verify & continue'}

          {!isSubmitting && <ArrowRight size={18} />}

        </button>



        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">

          <Link

            to="/admin/login"

            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"

          >

            <ArrowLeft size={16} />

            Back to login

          </Link>



          <button

            type="button"

            onClick={handleResend}

            disabled={isResending}

            className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-60 cursor-pointer"

          >

            <RefreshCw size={16} className={isResending ? 'animate-spin' : ''} />

            {isResending ? 'Sending...' : 'Resend code'}

          </button>

        </div>

      </form>

    </AdminAuthShell>

  );

}



export default AdminVerifyOtp;

