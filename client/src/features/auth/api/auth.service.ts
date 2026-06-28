import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  User,
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResetOtpInput,
  ForgotPasswordInput,
  VerifyResetOtpInput,
  ResetPasswordInput,
} from '@/types/auth';

const AUTH_URL = '/auth';

export const registerUser = async (data: RegisterInput): Promise<ApiResponse<User>> => {
  const res = await api.post<ApiResponse<User>>(`${AUTH_URL}/register`, data);
  return res.data;
};

export const loginUser = async (data: LoginInput): Promise<ApiResponse<User>> => {
  const res = await api.post<ApiResponse<User>>(`${AUTH_URL}/login`, data);
  return res.data;
};

export const verifyOtp = async (data: VerifyOtpInput): Promise<ApiResponse<User>> => {
  const res = await api.post<ApiResponse<User>>(`${AUTH_URL}/verify-otp`, data);
  return res.data;
};

export const resetOtp = async (data: ResetOtpInput): Promise<ApiResponse<null>> => {
  const res = await api.post<ApiResponse<null>>(`${AUTH_URL}/reset-otp`, data);
  return res.data;
};

export const getMe = async (): Promise<ApiResponse<User>> => {
  const res = await api.get<ApiResponse<User>>(`${AUTH_URL}/me`);
  return res.data;
};

export const logoutUser = async (): Promise<ApiResponse<null>> => {
  const res = await api.post<ApiResponse<null>>(`${AUTH_URL}/logout`);
  return res.data;
};

export const logoutAllDevices = async (): Promise<ApiResponse<null>> => {
  const res = await api.post<ApiResponse<null>>(`${AUTH_URL}/logout-all`);
  return res.data;
};

export const forgotPassword = async (data: ForgotPasswordInput): Promise<ApiResponse<null>> => {
  const res = await api.post<ApiResponse<null>>(`${AUTH_URL}/forgot-password`, data);
  return res.data;
};

export const verifyResetOtp = async (data: VerifyResetOtpInput): Promise<ApiResponse<null>> => {
  const res = await api.post<ApiResponse<null>>(`${AUTH_URL}/verify-reset-otp`, data);
  return res.data;
};

export const resetPassword = async (data: ResetPasswordInput): Promise<ApiResponse<null>> => {
  const res = await api.post<ApiResponse<null>>(`${AUTH_URL}/reset-password`, data);
  return res.data;
};
