import { z } from 'zod';

// 1. Define base fields that a user can provide
const baseAccountFields = {
  email: z.string().email().max(200),
  password: z.string().min(6), // Used for DB updates where hash is already generated
};

/**
 * The entrance roll number is split on the client into a code (e.g. ဆလမ) and a
 * number (e.g. ၂၁၂). They are stored joined with a dash, e.g. "ဆလမ-၂၁၂".
 */
const buildExamRollNo = (rollCode: string, rollNumber: string): string =>
  `${rollCode.trim()}-${rollNumber.trim()}`;

// 2. Define the Role Enum (for server-side validation/use)
const AccountRole = z.enum(['student', 'admin', 'super', 'owner']);
export type AccountRoleType = z.infer<typeof AccountRole>;

// 3. Create Schemas for API Requests
export const AccountSchema = {
  // CREATE (Internal - pre-hashed password, used for admin creation or internal logic)
  create: z.object(baseAccountFields),

  // --- AUTH Schemas (User interaction) ---

  // VERIFY ENTRANCE (read-only lookup for the first-year registration flow)
  verifyEntrance: z.object({
    examYear: z.string().min(1, 'Exam year is required'),
    rollCode: z.string().min(1, 'Roll code is required'),
    rollNumber: z.string().min(1, 'Roll number is required'),
    fatherName: z.string().min(1, 'Father name is required'),
  }),

  // REGISTER: User provides entrance identifiers + email/password.
  // The entrance identifiers are re-verified server-side to prevent bypassing
  // the lookup step.
  register: z.object({
    examYear: z.string().min(1, 'Exam year is required'),
    rollCode: z.string().min(1, 'Roll code is required'),
    rollNumber: z.string().min(1, 'Roll number is required'),
    fatherName: z.string().min(1, 'Father name is required'),
    email: baseAccountFields.email,
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one digit')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  }),

  // LOGIN: User provides email and plaintext password
  login: z.object({
    email: z.string().email('Must be a valid email address'),
    password: z.string().min(1, 'Password cannot be empty'),
  }),

  // VERIFY OTP: User provides email and 6-digit OTP
  verifyOtp: z.object({
    email: baseAccountFields.email,
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),

  // restOtp: User provides email to request OTP
  resetOtp: z.object({
    email: baseAccountFields.email,
  }),

  // forgotPassword: User provides email for password reset code
  forgotPassword: z.object({
    email: baseAccountFields.email,
  }),

  // verifyResetOtp: User provides email + OTP to check validity before entering new password
  verifyResetOtp: z.object({
    email: baseAccountFields.email,
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),

  // resetPassword: User provides email, otp, and new strong password
  resetPassword: z.object({
    email: baseAccountFields.email,
    otp: z.string().length(6, 'OTP must be 6 digits'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one digit')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  }),

  // -----------------------------------------

  // UPDATE: User can update their email or password (all optional)
  update: z.object({
    email: baseAccountFields.email.optional(),
    password: baseAccountFields.password.optional(),
  }),

  // SERVER_ROLE_UPDATE (Optional Admin Endpoint Schema):
  adminRoleUpdate: z.object({
    role: AccountRole,
  }),

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
    fatherEthnicity: z.object({ r1: z.string(), r2: z.string(), r3: z.string() }),
    motherEthnicity: z.object({ r1: z.string(), r2: z.string(), r3: z.string() }),

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
    parentPhone: z.string().min(1, 'Parent phone is required'),

    // ── Student contact ───────────────────────────────────────────────────
    student_contact: z.object({
      state: z.string().min(1),
      district: z.string().min(1),
      township: z.string().min(1),
      address: z.string().min(1),
    }),
    phoneNumber: z.string().min(1, 'Student phone is required'),
    std_email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  }),
};

// 4. Export Types for Auth
export type AccountVerifyEntranceInput = z.infer<typeof AccountSchema.verifyEntrance>;
export type AccountRegisterInput = z.infer<typeof AccountSchema.register>;
export type AccountLoginInput = z.infer<typeof AccountSchema.login>;
export type AccountVerifyOtpInput = z.infer<typeof AccountSchema.verifyOtp>;
export type AccountResetOtpInput = z.infer<typeof AccountSchema.resetOtp>;
export type AccountForgotPasswordInput = z.infer<typeof AccountSchema.forgotPassword>;
export type AccountVerifyResetOtpInput = z.infer<typeof AccountSchema.verifyResetOtp>;
export type AccountResetPasswordInput = z.infer<typeof AccountSchema.resetPassword>;
export type StudentProfileInput = z.infer<typeof AccountSchema.studentProfile>;
// 5. Export original Types (for consistency)
export type AccountCreate = z.infer<typeof AccountSchema.create>;
export type AccountUpdate = z.infer<typeof AccountSchema.update>;

/** Safe subset of an entrance record returned by the lookup endpoint. */
export type EntranceMatchDto = {
  entranceId: number;
  applicantNameMm: string;
  fatherNameMm: string;
  examYear: string;
  examRollNo: string;
  institution: 'computer' | 'technology';
  totalScore: number;
};

export { buildExamRollNo };

// The full database shape *including* role would be:
export type AccountDB = AccountCreate & {
  role: AccountRoleType;
  id: string; // example
  tokenVersion: number;
};
