import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/features/auth/schemas/auth.schema';
import {
  useForgotPasswordMutation,
  extractApiError,
} from '@/features/auth/hooks/useAuthQueries';
import type { ApiError } from '@/types/api';
import { AuthFormCard } from './AuthFormCard';
import {
  authAlertErrorClass,
  authAlertSuccessClass,
  authFieldLabelClass,
  authFormSubtitleClass,
  authFormTitleClass,
  authInputClass,
  authInputIconClass,
  authSubmitButtonClass,
} from './authFormStyles';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onOtpSent: (email: string) => void;
}

export const ForgotPasswordForm = ({
  onBack,
  onOtpSent,
}: ForgotPasswordFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useForgotPasswordMutation();

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        // Proceed to reset form even on generic "not found" success to prevent enumeration
        onOtpSent(data.email);
      },
      onError: (error) => {
        const apiError = extractApiError(error) as ApiError;
        if (apiError.errors?.fieldErrors?.email) {
          setError('email', { message: apiError.errors.fieldErrors.email[0] });
        } else {
          setError('root', {
            message:
              apiError.message ||
              'Failed to send reset code. Please try again.',
          });
        }
      },
    });
  };

  return (
    <AuthFormCard>
      <button
        type='button'
        onClick={onBack}
        className='mb-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant transition-transform active:scale-95'
      >
        <span className='material-symbols-outlined text-sm'>arrow_back</span>
        Back to login
      </button>

      <header className='mb-5 space-y-1.5'>
        <h1 className={authFormTitleClass}>Forgot password?</h1>
        <p className={authFormSubtitleClass}>
          Enter your email and we'll send you a verification code to reset your
          password.
        </p>
      </header>

      {/* Icon illustration */}
      {/* <div className='mb-5 flex justify-center'>
        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/15'>
          <span className='material-symbols-outlined text-3xl text-primary-container'>
            lock_reset
          </span>
        </div>
      </div> */}

      {errors.root && (
        <div className={authAlertErrorClass} role='alert'>
          <span className='material-symbols-outlined text-lg text-on-error-container'>
            error
          </span>
          <p className='text-sm font-medium text-on-error-container'>
            {errors.root.message}
          </p>
        </div>
      )}

      {forgotPasswordMutation.isSuccess && (
        <div className={authAlertSuccessClass} role='status'>
          <span className='material-symbols-outlined text-lg text-green-600'>
            check_circle
          </span>
          <p className='text-sm font-medium text-green-700'>
            Reset code sent! Redirecting...
          </p>
        </div>
      )}

      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className='space-y-1.5'>
          <label htmlFor='forgot-email' className={authFieldLabelClass}>
            Email address
          </label>
          <div className='group relative'>
            <span className={`${authInputIconClass} material-symbols-outlined`}>
              mail
            </span>
            <input
              id='forgot-email'
              {...register('email')}
              className={authInputClass}
              type='email'
              autoComplete='email'
              placeholder='your@email.com'
            />
          </div>
          {errors.email && (
            <p className='ml-0.5 mt-1 text-xs font-medium text-error'>
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          className={authSubmitButtonClass}
          type='submit'
          disabled={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? (
            <>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent' />
              Sending code...
            </>
          ) : (
            <>
              Send reset code
              <span className='material-symbols-outlined text-base'>send</span>
            </>
          )}
        </button>
      </form>
    </AuthFormCard>
  );
};
