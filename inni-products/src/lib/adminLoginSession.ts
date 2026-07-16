const EMAIL_KEY = 'admin_login_email';
const SENT_AT_KEY = 'admin_otp_sent_at';
const REDIRECT_KEY = 'admin_login_redirect';

export const ADMIN_OTP_LENGTH = 6;
export const ADMIN_OTP_TTL_SECONDS = 5 * 60;

export function setAdminLoginSession(email: string): void {
  sessionStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
  sessionStorage.setItem(SENT_AT_KEY, String(Date.now()));
}

export function setAdminLoginRedirect(path: string): void {
  if (path.startsWith('/admin') && path !== '/admin/login' && path !== '/admin/login/verify') {
    sessionStorage.setItem(REDIRECT_KEY, path);
  }
}

export function getAdminLoginRedirect(): string | null {
  return sessionStorage.getItem(REDIRECT_KEY);
}

export function getAdminLoginEmail(): string | null {
  return sessionStorage.getItem(EMAIL_KEY);
}

export function getOtpSentAt(): number | null {
  const raw = sessionStorage.getItem(SENT_AT_KEY);
  return raw ? Number(raw) : null;
}

export function getRemainingSeconds(): number {
  const sentAt = getOtpSentAt();
  if (!sentAt) return 0;
  const elapsed = Math.floor((Date.now() - sentAt) / 1000);
  return Math.max(0, ADMIN_OTP_TTL_SECONDS - elapsed);
}

export function isOtpExpired(): boolean {
  return getRemainingSeconds() === 0;
}

export function clearAdminLoginSession(): void {
  sessionStorage.removeItem(EMAIL_KEY);
  sessionStorage.removeItem(SENT_AT_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);
}

export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
