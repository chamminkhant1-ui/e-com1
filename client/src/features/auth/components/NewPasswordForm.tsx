import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResetPasswordMutation, extractApiError } from '@/features/auth/hooks/useAuthQueries';
import type { ApiError } from '@/types/api';
import { AuthFormCard } from './AuthFormCard';
import { AuthPasswordField } from './AuthPasswordField';
import {
  authAlertErrorClass,
  authFieldLabelClass,
  authFormSubtitleClass,
  authFormTitleClass,
  authSubmitButtonClass,
} from './authFormStyles';

interface NewPasswordFormProps {
  email: string;
  otp: string;
  onBack: () => void;
  onSuccess: () => void;
}

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

const strengthRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export const NewPasswordForm = ({ email, otp, onBack, onSuccess }: NewPasswordFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  });

  const password = watch('password', '');
  const resetMutation = useResetPasswordMutation();

  const onSubmit = (data: NewPasswordFormData) => {
    resetMutation.mutate(
      { email, otp, password: data.password },
      {
        onSuccess: () => onSuccess(),
        onError: (err) => {
          const apiError = extractApiError(err) as ApiError;
          setError('root', {
            message: apiError.message || 'Failed to reset password. Please try again.',
          });
        },
      },
    );
  };

  return (
    <AuthFormCard className='animate-in zoom-in-95 duration-400'>
      <button
        type='button'
        onClick={onBack}
        className='mb-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant transition-transform active:scale-95'
      >
        <span className='material-symbols-outlined text-sm'>arrow_back</span>
        Back
      </button>

      <header className='mb-5 space-y-1.5'>
        <h1 className={authFormTitleClass}>Set new password</h1>
        <p className={authFormSubtitleClass}>
          Create a strong password for{' '}
          <span className='font-semibold text-secondary'>{email}</span>
        </p>
      </header>

      {/* Success indicator */}
      <div className='mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2'>
        <span className='material-symbols-outlined text-base text-green-600'>verified</span>
        <p className='text-xs font-semibold text-green-700'>Identity verified — choose your new password</p>
      </div>

      {errors.root && (
        <div className={authAlertErrorClass} role='alert'>
          <span className='material-symbols-outlined text-lg text-on-error-container'>error</span>
          <p className='text-sm font-medium text-on-error-container'>{errors.root.message}</p>
        </div>
      )}

      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthPasswordField
          id='new-password'
          label='New password'
          registration={register('password')}
          error={errors.password?.message}
          autoComplete='new-password'
        />

        {/* Live strength indicator */}
        <div className='rounded-xl bg-surface-container-high px-3 py-2.5 space-y-1.5'>
          <p className={`${authFieldLabelClass} mb-1`}>Password requirements</p>
          {strengthRules.map(({ label, test }) => {
            const passed = test(password);
            return (
              <div key={label} className='flex items-center gap-2'>
                <span
                  className={`material-symbols-outlined text-sm transition-colors ${
                    passed ? 'text-green-500' : 'text-outline'
                  }`}
                >
                  {passed ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span
                  className={`text-xs transition-colors ${
                    passed ? 'font-semibold text-green-700' : 'text-on-surface-variant'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <AuthPasswordField
          id='confirm-password'
          label='Confirm password'
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete='new-password'
        />

        <button
          className={authSubmitButtonClass}
          type='submit'
          disabled={resetMutation.isPending}
        >
          {resetMutation.isPending ? (
            <>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent' />
              Saving...
            </>
          ) : (
            <>
              Save new password
              <span className='material-symbols-outlined text-base'>lock_reset</span>
            </>
          )}
        </button>
      </form>
    </AuthFormCard>
  );
};
