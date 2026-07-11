import { z } from 'zod';

export const StudentSchema = {
  // STUDENT PROFILE: Authenticated student submits their full registration form data.
  studentProfile: z.object({
    // ── Names ──────────────────────────────────────────────────────────────
    nameMm: z.string().min(1, 'Student Myanmar name is required'),
    nameEn: z.string().min(1, 'Student English name is required'),
    fatherNameMm: z.string().min(1, 'Father Myanmar name is required'),
    fatherNameEn: z.string().min(1, 'Father English name is required'),
    motherNameMm: z.string().min(1, 'Mother Myanmar name is required'),
    motherNameEn: z.string().min(1, 'Mother English name is required'),

    // ── NRC (structured: region/city/prefix/number) ─────────────────────
    studentNrc: z.object({
      region: z.string().min(1),
      city: z.string().min(1),
      prefix: z.string().min(1),
      number: z.string().min(1),
    }),
    fatherNrc: z.object({
      region: z.string().min(1),
      city: z.string().min(1),
      prefix: z.string().min(1),
      number: z.string().min(1),
    }),
    motherNrc: z.object({
      region: z.string().min(1),
      city: z.string().min(1),
      prefix: z.string().min(1),
      number: z.string().min(1),
    }),

    // ── Race (r1 = main race, r2/r3 optional sub-race) ──────────────────
    ethnicity: z.object({ r1: z.string(), r2: z.string(), r3: z.string() }),
    fatherEthnicity: z.object({
      r1: z.string(),
      r2: z.string(),
      r3: z.string(),
    }),
    motherEthnicity: z.object({
      r1: z.string(),
      r2: z.string(),
      r3: z.string(),
    }),

    // ── Religion ─────────────────────────────────────────────────────────
    religion: z.string().min(1, 'Student religion is required'),
    fatherReligion: z.string().min(1, 'Father religion is required'),
    motherReligion: z.string().min(1, 'Mother religion is required'),

    // ── Student personal ─────────────────────────────────────────────────
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['M', 'F', 'Other']),

    // ── Matriculation ─────────────────────────────────────────────────────
    entryAcademicYear: z.string().min(1, 'Entry academic year is required'),
    matriPlaceSelect: z.string().min(1, 'Matri place code is required'),
    matriRollNumber: z.string().min(1, 'Roll number is required'),
    highSchoolName: z.string().min(1, 'High school name is required'),

    // ── Parent occupation ─────────────────────────────────────────────────
    fatherJob: z.string().min(1, 'Father occupation is required'),
    motherJob: z.string().min(1, 'Mother occupation is required'),

    // ── Parent contact ────────────────────────────────────────────────────
    parent_contact: z.object({
      state: z.string().min(1),
      district: z.string().min(1),
      township: z.string().min(1),
      address: z.string().min(1),
    }),
    parentPhone: z
      .string()
      .min(1, 'Parent phone is required')
      .regex(/^[0-9]{8,11}$/, 'Parent phone must be 8 to 11 English digits'),

    // ── Student contact ───────────────────────────────────────────────────
    student_contact: z.object({
      state: z.string().min(1),
      district: z.string().min(1),
      township: z.string().min(1),
      address: z.string().min(1),
    }),
    phoneNumber: z
      .string()
      .min(1, 'Student phone is required')
      .regex(/^[0-9]{8,11}$/, 'Student phone must be 8 to 11 English digits'),
    std_email: z
      .string()
      .email('Must be a valid email')
      .optional()
      .or(z.literal('')),
  }),

  // UPDATE STATUS
  updateStatus: z.object({
    status: z.enum([
      'PROFILE_COMPLETED',
      'NRC_UPLOADED',
      'DOCUMENTS_UPLOADED',
      'APPROVED',
      'REJECTED'
    ]),
  }),
};

export type StudentProfileInput = z.infer<typeof StudentSchema.studentProfile>;
export type UpdateStatusInput = z.infer<typeof StudentSchema.updateStatus>;
