export type Role = 'student' | 'teacher' | 'admin' | 'super';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  hasStudentProfile?: boolean;
  studentId?: number;
}

export interface RegisterInput {
  username: string;
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
  password:  string;
}
