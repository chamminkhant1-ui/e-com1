import { z } from 'zod';

export const AcademicSchema = {
  createMajor: z.object({
    majorCode: z.string().min(1, 'Major code is required').max(50),
    majorNameMm: z.string().min(1, 'Myanmar major name is required').max(255),
    majorNameEn: z.string().optional().nullable(),
    institution: z.enum(['computer', 'technology'] as const),
  }),

  updateMajor: z.object({
    majorNameMm: z.string().min(1, 'Myanmar major name is required').max(255).optional(),
    majorNameEn: z.string().optional().nullable(),
    institution: z.enum(['computer', 'technology'] as const).optional(),
  }),

  createAcademicYear: z.object({
    academicYearId: z.string().min(1, 'Academic year ID is required').max(15),
    isActive: z.boolean().optional().default(true),
  }),

  updateAcademicYear: z.object({
    isActive: z.boolean(),
  }),

  createSemester: z.object({
    semesterName: z.string().min(1, 'Semester name is required').max(100),
    numericalLevel: z.number().int().min(1, 'Numerical level must be a positive integer'),
  }),

  updateSemester: z.object({
    semesterName: z.string().min(1, 'Semester name is required').max(100).optional(),
    numericalLevel: z.number().int().min(1).optional(),
  }),
};

export type AcademicCreateMajorInput = z.infer<typeof AcademicSchema.createMajor>;
export type AcademicUpdateMajorInput = z.infer<typeof AcademicSchema.updateMajor>;
export type AcademicCreateYearInput = z.infer<typeof AcademicSchema.createAcademicYear>;
export type AcademicUpdateYearInput = z.infer<typeof AcademicSchema.updateAcademicYear>;
export type AcademicCreateSemesterInput = z.infer<typeof AcademicSchema.createSemester>;
export type AcademicUpdateSemesterInput = z.infer<typeof AcademicSchema.updateSemester>;
