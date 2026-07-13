import { api } from '../../lib/api';

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  message: string;
}

export async function submitContactMessage(
  payload: ContactMessagePayload,
): Promise<ContactMessageResponse> {
  const { data } = await api.post<ContactMessageResponse>('/contact/', payload);
  return data;
}
