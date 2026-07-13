import { api } from '../../lib/api';

export type PartnershipType =
  | 'restaurant_chef'
  | 'retail_distributor'
  | 'catering_events';

export interface PartnerApplicationPayload {
  business_name: string;
  email: string;
  partnership_type: PartnershipType;
  message?: string;
}

export interface PartnerApplicationResponse {
  message: string;
}

export async function submitPartnerApplication(
  payload: PartnerApplicationPayload,
): Promise<PartnerApplicationResponse> {
  const { data } = await api.post<PartnerApplicationResponse>('/partner/', payload);
  return data;
}
