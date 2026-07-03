import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import {
  loginUser,
  registerUser,
  verifyOtp,
  resetOtp,
  logoutUser,
  logoutAllDevices,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  verifyEntrance,
  submitStudentProfile,
} from '../api/auth.service';
import type { ApiError } from '@/types/api';
import type {
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
  ResetOtpInput,
  ForgotPasswordInput,
  VerifyResetOtpInput,
  ResetPasswordInput,
  VerifyEntranceInput,
} from '@/types/auth';
import { AxiosError } from 'axios';

/**
 * Extracts the API error body from an Axios error.
 */
const extractApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError && error.response?.data) {
    return error.response.data as ApiError;
  }
  return {
    ok: false,
    message: 'An unexpected network error occurred.',
  };
};

export const useVerifyEntranceMutation = () => {
  return useMutation({
    mutationFn: (data: VerifyEntranceInput) => verifyEntrance(data),
    throwOnError: false,
  });
};

export const useLoginMutation = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: async (res) => {
      if (res.ok) {
        setUser(res.data);
        await queryClient.invalidateQueries({ queryKey: ['session'] });
      }
    },
    onError: (error) => extractApiError(error),
    // Let the component handle errors via mutation.error
    throwOnError: false,
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: RegisterInput) => registerUser(data),
    throwOnError: false,
  });
};



export const useVerifyOtpMutation = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyOtpInput) => verifyOtp(data),
    onSuccess: async (res) => {
      if (res.ok && res.data) {
        setUser(res.data);
        await queryClient.invalidateQueries({ queryKey: ['session'] });
      }
    },
    throwOnError: false,
  });
};

export const useResetOtpMutation = () => {
  return useMutation({
    mutationFn: (data: ResetOtpInput) => resetOtp(data),
    throwOnError: false,
  });
};

export const useLogoutMutation = () => {
  const clearUser = useAuthStore((s) => s.clearUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      clearUser();
      queryClient.removeQueries({ queryKey: ['session'] });
    },
    throwOnError: false,
  });
};

export const useLogoutAllMutation = () => {
  const clearUser = useAuthStore((s) => s.clearUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutAllDevices(),
    onSuccess: () => {
      clearUser();
      queryClient.removeQueries({ queryKey: ['session'] });
    },
    throwOnError: false,
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => forgotPassword(data),
    throwOnError: false,
  });
};

export const useVerifyResetOtpMutation = () => {
  return useMutation({
    mutationFn: (data: VerifyResetOtpInput) => verifyResetOtp(data),
    throwOnError: false,
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordInput) => resetPassword(data),
    throwOnError: false,
  });
};

export const useSubmitStudentProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => submitStudentProfile(data),
    onSuccess: async () => {
      // Refresh session so hasStudentProfile updates
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    throwOnError: false,
  });
};

export { extractApiError };
