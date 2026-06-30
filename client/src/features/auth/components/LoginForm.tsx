import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  type LoginFormData,
} from '@/features/auth/schemas/auth.schema';
import {
  useLoginMutation,
  extractApiError,
} from '@/features/auth/hooks/useAuthQueries';
import type { ApiError } from '@/types/api';
import { AuthFormCard } from './AuthFormCard';
import { AuthPasswordField } from './AuthPasswordField';
import {
  authAlertErrorClass,
  authAlertSuccessClass,
  authFieldLabelClass,
  authFormTitleClass,
  authInputClass,
  authInputErrorClass,
  authInputIconClass,
  authSubmitButtonClass,
} from './authFormStyles';

interface LoginFormProps {
  onNavigateToForgotPassword: () => void;
  successMessage?: string;
}

export const LoginForm = ({
  onNavigateToForgotPassword,
  successMessage,
}: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLoginMutation();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onError: (error) => {
        const apiError = extractApiError(error) as ApiError;

        if (apiError.errors?.fieldErrors) {
          for (const [field, messages] of Object.entries(
            apiError.errors.fieldErrors,
          )) {
            if (field === 'email' || field === 'password') {
              setError(field, { message: messages[0] });
            }
          }
        }

        if (apiError.errors?.formErrors?.length) {
          setError('root', { message: apiError.errors.formErrors[0] });
        } else if (apiError.message && !apiError.errors?.fieldErrors) {
          setError('root', { message: apiError.message });
        }
      },
    });
  };

  return (
    <AuthFormCard>
      <header className='mb-5 text-center md:mb-6 md:text-left'>
        <h1 className={authFormTitleClass}>Welcome back</h1>
        <p className='mt-1 text-sm text-on-surface-variant'>
          Sign in with your institutional account
        </p>
      </header>

      {successMessage && (
        <div className={authAlertSuccessClass} role='status'>
          <span className='material-symbols-outlined text-lg text-green-600'>
            check_circle
          </span>
          <p className='text-sm font-medium text-green-700'>{successMessage}</p>
        </div>
      )}

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

      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className='space-y-1.5'>
          <label htmlFor='login-email' className={authFieldLabelClass}>
            Email
          </label>
          <div className='group relative'>
            <span className={`${authInputIconClass} material-symbols-outlined`}>
              mail
            </span>
            <input
              id='login-email'
              {...register('email')}
              className={`${authInputClass} ${errors.email ? authInputErrorClass : ''}`}
              type='email'
              autoComplete='email'
            />
          </div>
          {errors.email && (
            <p className='ml-0.5 mt-1 text-xs font-medium text-error'>
              {errors.email.message}
            </p>
          )}
        </div>

        <AuthPasswordField
          id='login-password'
          label='Password'
          registration={register('password')}
          error={errors.password?.message}
          autoComplete='current-password'
        />

        <div className='flex items-center justify-between gap-3 py-0.5'>
          <label className='group flex cursor-pointer items-center gap-2'>
            <input
              className='rounded border-outline-variant text-primary-container focus:ring-primary-container/30'
              type='checkbox'
            />
            <span className='text-xs font-medium text-on-surface-variant group-hover:text-primary-container'>
              Remember me
            </span>
          </label>
          <button
            type='button'
            className='text-xs font-semibold text-secondary hover:underline md:text-primary-container bg-transparent border-none p-0 cursor-pointer'
            onClick={onNavigateToForgotPassword}
          >
            Forgot password?
          </button>
        </div>

        <button
          className={authSubmitButtonClass}
          type='submit'
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent' />
              Logging in...
            </>
          ) : (
            <>
              Log in
              <span className='material-symbols-outlined text-base'>
                arrow_forward
              </span>
            </>
          )}
        </button>
      </form>

      <div className='mt-6 border-t border-outline-variant/15 pt-5 text-center'>
        <p className='text-sm text-on-surface-variant'>
          First-year student?{' '}
          <Link
            to='/first-year-registration'
            className='font-bold text-primary-container hover:text-secondary'
          >
            Register here
          </Link>
        </p>
      </div>
    </AuthFormCard>
  );
};
