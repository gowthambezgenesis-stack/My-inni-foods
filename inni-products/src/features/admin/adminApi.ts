import { api } from '../../lib/api';
import { Order, User } from '../../types';

export interface DashboardStats {
  /** Orders created in the current calendar month. */
  total_orders: number;
  /** Paid revenue for the current calendar month. */
  total_revenue: number | null;
  not_delivered_orders: number;
  todays_sales: number | null;
  todays_orders: number;
  /** Paid orders created in the current calendar month. */
  paid_orders: number;
  recent_orders: Order[];
  users_by_role: Record<string, number>;
  is_super_admin?: boolean;
}

export interface CreateAdminPayload {
  email: string;
  role: string;
  full_name?: string;
}

export interface CreateAdminResponse {
  message: string;
  email: string;
  user: AdminUser;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_profile_active: boolean | null;
  last_login: string | null;
  last_login_ip: string | null;
  date_joined: string;
  admin_notes: string | null;
}

export interface AuthResponse {
  access: string;
  user: User;
}

export interface OtpMessageResponse {
  message: string;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/admin/dashboard/stats/');
  return data;
}

export async function fetchAdminUsers(params?: { role?: string; search?: string }): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>('/admin/users/', { params });
  return data;
}

export async function updateUserRole(userId: number, role: string): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/admin/users/${userId}/role/`, { role });
  return data;
}

export async function removeAdminUser(userId: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/admin/users/${userId}/`);
  return data;
}

export async function createAdmin(payload: CreateAdminPayload): Promise<CreateAdminResponse> {
  const { data } = await api.post<CreateAdminResponse>('/admin/users/create/', payload);
  return data;
}

/** Request OTP — only sent if email is a registered admin user. */
export async function sendAdminOtp(email: string): Promise<OtpMessageResponse> {
  const { data } = await api.post<OtpMessageResponse>('/admin/auth/send-otp/', { email });
  return { message: data.message };
}

/** Verify emailed OTP and receive JWT (refresh token stored in HttpOnly cookie). */
export async function verifyAdminOtp(email: string, otp: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/admin/auth/verify-otp/', { email, otp });
  return data;
}
