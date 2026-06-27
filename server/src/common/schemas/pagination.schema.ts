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
      // Ensure it's between 1 and a safe maximum limit (e.g., 50)
      const safeNum = isNaN(num) || num < 1 ? 10 : num;
      return Math.min(safeNum, 50);
    }),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
