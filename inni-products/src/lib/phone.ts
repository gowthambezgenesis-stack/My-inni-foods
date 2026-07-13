export const DEFAULT_PHONE_COUNTRY_CODE = '+91';

export const PHONE_COUNTRY_CODES = [
  { value: '+91', label: '+91' },
  { value: '+1', label: '+1' },
  { value: '+44', label: '+44' },
  { value: '+971', label: '+971' },
  { value: '+65', label: '+65' },
  { value: '+61', label: '+61' },
] as const;

export function getPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhoneWithCountryCode(
  phone: string,
  countryCode: string = DEFAULT_PHONE_COUNTRY_CODE,
): string {
  const digits = getPhoneDigits(phone);
  if (!digits) return '';
  const code = countryCode.trim() || DEFAULT_PHONE_COUNTRY_CODE;
  return `${code} ${digits}`;
}

export function formatShippingPhone(address?: {
  phone?: string;
  phoneCountryCode?: string;
} | null): string {
  if (!address?.phone) return '';
  return formatPhoneWithCountryCode(address.phone, address.phoneCountryCode);
}
