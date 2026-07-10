import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerSchema,
  type RegisterFormData,
} from '@/features/auth/schemas/auth.schema';
import {
  useRegisterMutation,
  extractApiError,
} from '@/features/auth/hooks/useAuthQueries';
import type { ApiError } from '@/types/api';
import type { EntranceMatchInfo } from '@/types/auth';
import { AuthFormCard } from './AuthFormCard';
import { AuthPasswordField } from './AuthPasswordField';
import {
  authAlertErrorClass,
  authFieldLabelClass,
  authFormSubtitleClass,
  authFormTitleClass,
  authInputClass,
  authInputErrorClass,
  authInputIconClass,
  authSubmitButtonClass,
} from './authFormStyles';

interface RegisterFormProps {
  /** Confirmed entrance match from the lookup step. */
  entrance: EntranceMatchInfo;
  /** Entrance identifiers typed by the user in the lookup step. */
  entranceInput: {
    examYear: string;
    rollCode: string;
    rollNumber: string;
    fatherName: string;
  };
  onBack: () => void;
  onRegistered: (email: string) => void;
}

export const RegisterForm = ({
  entrance,
  entranceInput,
  onBack,
  onRegistered,
}: RegisterFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      // Carry the entrance identifiers through so the full payload is posted.
      examYear: entranceInput.examYear,
      rollCode: entranceInput.rollCode,
      rollNumber: entranceInput.rollNumber,
      fatherName: entranceInput.fatherName,
      email: '',
      password: '',
    },
  });

  const registerMutation = useRegisterMutation();

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: (res: { ok?: boolean }) => {
        if (res.ok) {
          onRegistered(data.email);
        }
      },
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
      <button
        type='button'
        onClick={onBack}
        className='mb-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant transition-transform active:scale-95'
      >
        <span className='material-symbols-outlined text-sm'>arrow_back</span>
        Back
      </button>

      <header className='mb-5 space-y-1.5'>
        <h1 className={authFormTitleClass}>Create account</h1>
        <p className={authFormSubtitleClass}>
          Set your email and password to finish registration.
        </p>
      </header>

      <div className='mb-5 flex items-center gap-3 rounded-2xl bg-surface-1/60 px-4 py-3'>
        <span className='material-symbols-outlined text-2xl text-primary-container'>
          account_circle
        </span>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-on-surface'>
            {entrance.applicantNameMm}
          </p>
          <p className='truncate text-xs text-on-surface-variant'>
            {entrance.matricExamRollNo} · {entrance.examYear}
          </p>
        </div>
      </div>

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

      <form
        className='space-y-3.5'
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className='space-y-1.5'>
          <label htmlFor='register-email' className={authFieldLabelClass}>
            Email
          </label>
          <div className='group relative'>
            <span className={`${authInputIconClass} material-symbols-outlined`}>
              mail
            </span>
            <input
              id='register-email'
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
          id='register-password'
          label='Password'
          registration={register('password')}
          error={errors.password?.message}
          autoComplete='new-password'
        />

        <p className='text-xs leading-relaxed text-on-surface-variant'>
          By registering, you agree to our{' '}
          <span className='cursor-pointer font-semibold text-secondary hover:underline'>
            Terms of Service
          </span>
          .
        </p>

        <button
          className={authSubmitButtonClass}
          type='submit'
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent' />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <span className='material-symbols-outlined text-base'>
                person_add
              </span>
            </>
          )}
        </button>
      </form>
    </AuthFormCard>
  );
};
