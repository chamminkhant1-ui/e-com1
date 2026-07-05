import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { EntranceRecord } from '../types/entrance';

const ENTRANCE_URL = '/entrance';

/**
 * Fetches the full entrance record for the authenticated student.
 */
export const getMyEntrance = async (): Promise<ApiResponse<EntranceRecord>> => {
  const res = await api.get<ApiResponse<EntranceRecord>>(`${ENTRANCE_URL}/me`);
  return res.data;
};
