import { z } from 'zod';

/**
 * Safe DTO returned to the authenticated student for their linked entrance record.
 * Excludes internal fields (isClaimed, deletedAt, etc.).
 */
export const EntranceDtoSchema = z.object({
  entranceId: z.number(),
  examYear: z.string(),
  examRollNo: z.string(),
  applicantNameMm: z.string(),
  fatherNameMm: z.string(),
  nrcNumber: z.string(),
  institution: z.enum(['computer', 'technology']),
  totalScore: z.number(),
  subjectGroupScore: z.number().nullable().optional(),
  applicationNo: z.string(),
});

export type EntranceDto = z.infer<typeof EntranceDtoSchema>;
