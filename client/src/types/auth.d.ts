export type Role = 'student' | 'admin' | 'super' | 'owner';

export interface User {
  id: number;
  email: string;
  role: Role;
  hasStudentProfile?: boolean;
  studentId?: number;
  entrance?: EntranceMatchInfo | null;
  serverDate?: string;
}

export interface VerifyEntranceInput {
  examYear: string;
  rollCode: string;
  rollNumber: string;
  fatherName: string;
}

/**
 * Safe subset of an entrance record returned by the verify-entrance endpoint.
 */
export interface EntranceMatchInfo {
  entranceId: number;
  applicantNameMm: string;
  fatherNameMm: string;
  examYear: string;
  examRollNo: string;
  institution: 'computer' | 'technology';
  totalScore: number;
}

export interface RegisterInput extends VerifyEntranceInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface ResetOtpInput {
  email: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface VerifyResetOtpInput {
  email: string;
  otp: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  password: string;
}
