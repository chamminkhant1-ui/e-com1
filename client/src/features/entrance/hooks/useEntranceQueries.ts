import { useQuery } from '@tanstack/react-query';
import { getMyEntrance } from '../api/entrance.service';

/**
 * TanStack Query hook that fetches the authenticated student's entrance record.
 * Enabled only when `enabled` is true (typically once the session is confirmed).
 */
export const useEntranceQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['entrance', 'me'],
    queryFn: getMyEntrance,
    enabled,
    staleTime: 10 * 60 * 1000, // entrance data rarely changes
    retry: 1,
    select: (res) => (res.ok ? res.data : null),
  });
};
