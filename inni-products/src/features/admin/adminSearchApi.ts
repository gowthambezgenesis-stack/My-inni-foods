import { api } from '../../lib/api';

export interface AdminSearchSuggestion {
  id: string;
  order_number: string;
  customer_name: string;
  city: string;
  total_amount: number;
  status: string;
  highlight_order_number?: string;
  highlight_customer_name?: string;
  highlight_city?: string;
  source: 'meilisearch' | 'database';
}

export interface AdminSearchSuggestionsResponse {
  results: AdminSearchSuggestion[];
  source: 'meilisearch' | 'database' | 'none';
}

export async function fetchAdminSearchSuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<AdminSearchSuggestionsResponse> {
  const { data } = await api.get<AdminSearchSuggestionsResponse>('/admin/search/suggestions/', {
    params: { q: query, limit: 8 },
    signal,
  });
  return data;
}
