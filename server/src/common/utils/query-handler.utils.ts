import { z } from 'zod';
import { Repository } from 'typeorm';
import { buildPaginationResponse } from './pagination.utils';

// Schema for validated pagination/search/sort queries
export const ReusableQuerySchema = z.object({
  page: z.string().optional().default('1').transform((val) => {
    const num = Number(val);
    return isNaN(num) || num < 1 ? 1 : num;
  }),
  limit: z.string().optional().default('10').transform((val) => {
    const num = Number(val);
    if (isNaN(num)) return 10;
    // Allowed values: 10, 25, 50, 100
    if ([10, 25, 50, 100].includes(num)) {
      return num;
    }
    return 10; // default to 10
  }),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z
    .enum(['ASC', 'DESC', 'asc', 'desc'])
    .optional()
    .default('ASC')
    .transform((val) => val.toUpperCase() as 'ASC' | 'DESC'),
}).catchall(z.string().optional()); // treat other query parameters as potential filters

export type ReusableQueryType = z.infer<typeof ReusableQuerySchema>;

export interface QueryConfig {
  searchFields?: string[];
  allowedFilters?: string[];
  relations?: string[];
  /** Maps query param keys to joined relation column paths (e.g. major -> desiredSemesterInstance.major) */
  relationFilters?: Record<string, string>;
  defaultSortBy?: string;
  defaultSortOrder?: 'ASC' | 'DESC';
}

/**
 * Reusable TypeORM paginator and query handler.
 * Applies search, filters, relations, sorting, and pagination dynamically.
 */
export async function paginateQuery<T extends object>(
  repository: Repository<T>,
  alias: string,
  query: ReusableQueryType,
  config?: QueryConfig
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const queryBuilder = repository.createQueryBuilder(alias);

  // 1. Search (case-insensitive partial match using ILIKE)
  if (query.search && config?.searchFields && config.searchFields.length > 0) {
    const searchPattern = `%${query.search}%`;
    const searchConditions = config.searchFields.map((field, index) => {
      const paramName = `search_${index}`;
      const fullFieldName = field.includes('.') ? field : `${alias}.${field}`;
      return {
        sql: `${fullFieldName} ILIKE :${paramName}`,
        params: { [paramName]: searchPattern },
      };
    });

    const sqlStr = searchConditions.map((c) => c.sql).join(' OR ');
    const paramsObj = searchConditions.reduce(
      (acc, curr) => ({ ...acc, ...curr.params }),
      {}
    );

    queryBuilder.andWhere(`(${sqlStr})`, paramsObj);
  }

  // 2. Filters (exact matches)
  if (config?.allowedFilters) {
    config.allowedFilters.forEach((filterKey) => {
      const val = query[filterKey];
      if (val !== undefined && val !== null && val !== '') {
        const fullFieldName = filterKey.includes('.') ? filterKey : `${alias}.${filterKey}`;
        const paramName = `filter_${filterKey.replace('.', '_')}`;
        queryBuilder.andWhere(`${fullFieldName} = :${paramName}`, { [paramName]: val });
      }
    });
  }

  // 3. Relations
  if (config?.relations) {
    config.relations.forEach((relation) => {
      if (relation.includes('.')) {
        const parts = relation.split('.');
        const parent = parts[parts.length - 2];
        const child = parts[parts.length - 1];
        queryBuilder.leftJoinAndSelect(`${parent}.${child}`, child);
      } else {
        queryBuilder.leftJoinAndSelect(`${alias}.${relation}`, relation);
      }
    });
  }

  // 4. Relation filters (require joins from step 3)
  if (config?.relationFilters) {
    Object.entries(config.relationFilters).forEach(([paramKey, sqlField]) => {
      const val = query[paramKey];
      if (val !== undefined && val !== null && val !== '') {
        const paramName = `relfilter_${paramKey}`;
        const isNumeric =
          sqlField.endsWith('yearLevel') || sqlField.endsWith('semesterNumber');
        const parsed = isNumeric ? Number(val) : val;
        if (isNumeric && isNaN(Number(val))) return;
        queryBuilder.andWhere(`${sqlField} = :${paramName}`, { [paramName]: parsed });
      }
    });
  }

  // 5. Sorting
  const sortBy = query.sortBy || config?.defaultSortBy;
  const sortOrder = query.sortOrder || config?.defaultSortOrder || 'ASC';

  if (sortBy) {
    const fullSortField = sortBy.includes('.') ? sortBy : `${alias}.${sortBy}`;
    queryBuilder.orderBy(fullSortField, sortOrder);
  } else {
    // Fallback: order by createdAt if available on metadata
    const columns = repository.metadata.columns.map((c) => c.propertyName);
    if (columns.includes('createdAt')) {
      queryBuilder.orderBy(`${alias}.createdAt`, 'DESC');
    }
  }

  // 6. Pagination
  queryBuilder.skip(skip).take(limit);

  // 7. Execute query
  const [data, total] = await queryBuilder.getManyAndCount();

  return buildPaginationResponse(data, total, page, limit);
}
