// utils/pagination.utils.ts

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Calculates TypeORM skip/take (offset/limit) and returns the actual page/limit used.
 */
export function getPagination({ page = 1, limit = 10 }: PaginationParams) {
  // Ensure page and limit are positive integers before use
  const actualPage = Math.max(1, page);
  const actualLimit = Math.max(1, limit);

  const skip = (actualPage - 1) * actualLimit;
  return { skip, take: actualLimit, page: actualPage, limit: actualLimit };
}

/**
 * Formats the final response object with calculated metadata.
 */
export function buildPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}