import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  // page is optional, defaults to "1" if missing, transforms to a positive number
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => {
      const num = Number(val);
      // Ensure it's at least 1
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  // limit is optional, defaults to "10" if missing, transforms to a positive number (with max 50)
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => {
      const num = Number(val);
      const safeNum = isNaN(num) || num < 1 ? 10 : num;
      return Math.min(safeNum, 100);
    }),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const TableQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional().default(''),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

export type TableQuery = z.infer<typeof TableQuerySchema>;
