import { z } from 'zod';

// 1. Define base fields that a user can provide
const baseAccountFields = {
  username: z.string().min(3).max(100),
  email: z.string().email().max(200),
  password: z.string().min(6), // Used for DB updates where hash is already generated
};

// 2. Define the Role Enum (for server-side validation/use)
const AccountRole = z.enum(['student', 'teacher', 'admin', 'super']);
export type AccountRoleType = z.infer<typeof AccountRole>;

// 3. Create Schemas for API Requests
export const AccountSchema = {
  // CREATE (Internal - pre-hashed password, used for admin creation or internal logic)
  create: z.object(baseAccountFields),

  // --- AUTH Schemas (User interaction) ---

  // REGISTER: User provides plaintext password
  register: z.object({
    username: baseAccountFields.username,
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

  // UPDATE: User can update their username, email, or password (all optional)
  update: z.object({
    username: baseAccountFields.username.optional(),
    email: baseAccountFields.email.optional(),
    password: baseAccountFields.password.optional(),
  }),

  // SERVER_ROLE_UPDATE (Optional Admin Endpoint Schema):
  adminRoleUpdate: z.object({
    role: AccountRole,
  }),
};

// 4. Export Types for Auth
export type AccountRegisterInput = z.infer<typeof AccountSchema.register>;
export type AccountLoginInput = z.infer<typeof AccountSchema.login>;
export type AccountVerifyOtpInput = z.infer<typeof AccountSchema.verifyOtp>;
export type AccountResetOtpInput = z.infer<typeof AccountSchema.resetOtp>;
export type AccountForgotPasswordInput = z.infer<typeof AccountSchema.forgotPassword>;
export type AccountVerifyResetOtpInput = z.infer<typeof AccountSchema.verifyResetOtp>;
export type AccountResetPasswordInput = z.infer<typeof AccountSchema.resetPassword>;
// 5. Export original Types (for consistency)
export type AccountCreate = z.infer<typeof AccountSchema.create>;
export type AccountUpdate = z.infer<typeof AccountSchema.update>;

// The full database shape *including* role would be:
export type AccountDB = AccountCreate & {
  role: AccountRoleType;
  id: string; // example
  tokenVersion: number;
};
