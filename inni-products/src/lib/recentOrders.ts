import { getPhoneDigits } from './phone';

export interface RecentOrder {
  orderNumber: string;
  phone: string;
  savedAt: number;
}

const STORAGE_KEY = 'inni_recent_orders';
const MAX_RECENT_ORDERS = 20;

function readRecentOrders(): RecentOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is RecentOrder =>
          Boolean(item) &&
          typeof item.orderNumber === 'string' &&
          typeof item.phone === 'string' &&
          typeof item.savedAt === 'number',
      )
      .map((item) => ({
        orderNumber: item.orderNumber.trim().toUpperCase(),
        phone: getPhoneDigits(item.phone).slice(-10),
        savedAt: item.savedAt,
      }))
      .filter((item) => item.orderNumber && item.phone.length === 10);
  } catch {
    return [];
  }
}

function writeRecentOrders(orders: RecentOrder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getRecentOrders(): RecentOrder[] {
  return readRecentOrders().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveRecentOrder(orderNumber: string, phone: string): void {
  const normalizedOrder = orderNumber.trim().toUpperCase();
  const normalizedPhone = getPhoneDigits(phone).slice(-10);
  if (!normalizedOrder || normalizedPhone.length !== 10) {
    return;
  }

  const next = [
    { orderNumber: normalizedOrder, phone: normalizedPhone, savedAt: Date.now() },
    ...readRecentOrders().filter(
      (item) => !(item.orderNumber === normalizedOrder && item.phone === normalizedPhone),
    ),
  ].slice(0, MAX_RECENT_ORDERS);

  writeRecentOrders(next);
}

export function removeRecentOrder(orderNumber: string, phone: string): void {
  const normalizedOrder = orderNumber.trim().toUpperCase();
  const normalizedPhone = getPhoneDigits(phone).slice(-10);
  writeRecentOrders(
    readRecentOrders().filter(
      (item) => !(item.orderNumber === normalizedOrder && item.phone === normalizedPhone),
    ),
  );
}
