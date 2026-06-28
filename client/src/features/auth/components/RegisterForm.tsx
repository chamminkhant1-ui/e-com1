import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/auth.schema';
import { useRegisterMutation, extractApiError } from '@/features/auth/hooks/useAuthQueries';
import type { ApiError } from '@/types/api';
import { AuthFormCard } from './AuthFormCard';
import { AuthPasswordField } from './AuthPasswordField';
import {
  authAlertErrorClass,
  authFieldLabelClass,
  authFormTitleClass,
  authInputClass,
  authInputIconClass,
  authModeSwitcherActiveClass,
  authModeSwitcherInactiveClass,
  authModeSwitcherTrackClass,
  authModeSwitcherWrapClass,
  authSubmitButtonClass,
} from './authFormStyles';

interface RegisterFormProps {
  onNavigateToLogin: () => void;
  onNavigateToOtp: (email: string) => void;
}

export const RegisterForm = ({ onNavigateToLogin, onNavigateToOtp }: RegisterFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegisterMutation();

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: (res: { ok?: boolean }) => {
        if (res.ok) {
          onNavigateToOtp(data.email);
        }
      },
      onError: (error) => {
        const apiError = extractApiError(error) as ApiError;

        if (apiError.errors?.fieldErrors) {
          for (const [field, messages] of Object.entries(apiError.errors.fieldErrors)) {
            if (field === 'username' || field === 'email' || field === 'password') {
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
      <div className={authModeSwitcherWrapClass}>
        <div className={authModeSwitcherTrackClass}>
          <button type="button" onClick={onNavigateToLogin} className={authModeSwitcherInactiveClass}>
            Login
          </button>
          <button type="button" className={authModeSwitcherActiveClass}>
            Register
          </button>
        </div>
      </div>

      <header className="mb-5 text-center md:mb-6 md:text-left">
        <h1 className={authFormTitleClass}>Create account</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Register with your institutional details</p>
      </header>

      {errors.root && (
        <div className={authAlertErrorClass} role="alert">
          <span className="material-symbols-outlined text-lg text-on-error-container">error</span>
          <p className="text-sm font-medium text-on-error-container">{errors.root.message}</p>
        </div>
      )}

      <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <label htmlFor="register-username" className={authFieldLabelClass}>
            Username
          </label>
          <div className="group relative">
            <span className={`${authInputIconClass} material-symbols-outlined`}>person</span>
            <input
              id="register-username"
              {...register('username')}
              className={authInputClass}
              type="text"
              autoComplete="username"
            />
          </div>
          {errors.username && (
            <p className="ml-0.5 mt-1 text-xs font-medium text-error">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-email" className={authFieldLabelClass}>
            Institutional email
          </label>
          <div className="group relative">
            <span className={`${authInputIconClass} material-symbols-outlined`}>mail</span>
            <input
              id="register-email"
              {...register('email')}
              className={authInputClass}
              type="email"
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="ml-0.5 mt-1 text-xs font-medium text-error">{errors.email.message}</p>
          )}
        </div>

        <AuthPasswordField
          id="register-password"
          label="Password"
          registration={register('password')}
          error={errors.password?.message}
          autoComplete="new-password"
        />

        <p className="text-xs leading-relaxed text-on-surface-variant">
          By registering, you agree to our{' '}
          <span className="cursor-pointer font-semibold text-secondary hover:underline">
            Terms of Service
          </span>
          .
        </p>

        <button className={authSubmitButtonClass} type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <span className="material-symbols-outlined text-base">person_add</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-outline-variant/15 pt-5 text-center md:hidden">
        <p className="text-sm text-on-surface-variant">Already have an account?</p>
        <button
          className="mt-1 text-sm font-bold text-primary-container hover:text-secondary"
          type="button"
          onClick={onNavigateToLogin}
        >
          Sign in
        </button>
      </div>
    </AuthFormCard>
  );
};
