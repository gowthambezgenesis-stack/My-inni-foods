import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AdminSearchSuggestion,
  AdminSearchSuggestionsResponse,
  fetchAdminSearchSuggestions,
} from '../features/admin/adminSearchApi';
import { useDebouncedValue } from './useDebouncedValue';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export function useAdminSearchSuggestions(query: string, enabled = true) {
  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const [results, setResults] = useState<AdminSearchSuggestion[]>([]);
  const [source, setSource] = useState<AdminSearchSuggestionsResponse['source']>('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSource('none');
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchAdminSearchSuggestions(debouncedQuery, controller.signal)
      .then((payload) => {
        if (controller.signal.aborted) return;
        setResults(payload.results);
        setSource(payload.source);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || axios.isCancel(err)) return;
        setResults([]);
        setSource('none');
        setError(err instanceof Error ? err.message : 'Search failed');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery, enabled]);

  const showSuggestions = enabled && debouncedQuery.length >= MIN_QUERY_LENGTH;

  return {
    debouncedQuery,
    results,
    source,
    loading,
    error,
    showSuggestions,
    minQueryLength: MIN_QUERY_LENGTH,
  };
}
