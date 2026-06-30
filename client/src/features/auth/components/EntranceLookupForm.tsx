import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  verifyEntranceSchema,
  type VerifyEntranceFormData,
} from '@/features/auth/schemas/auth.schema';
import {
  useVerifyEntranceMutation,
  extractApiError,
} from '@/features/auth/hooks/useAuthQueries';
import type { ApiError } from '@/types/api';
import type { EntranceMatchInfo } from '@/types/auth';
import { AuthFormCard } from './AuthFormCard';
import {
  authAlertErrorClass,
  authFieldLabelClass,
  authFormSubtitleClass,
  authFormTitleClass,
  authInputClass,
  authInputIconClass,
  authSubmitButtonClass,
} from './authFormStyles';

interface EntranceLookupFormProps {
  /** Re-rendered with the previous submission so the user can edit after going back. */
  defaultValues?: Partial<VerifyEntranceFormData>;
  onMatched: (info: EntranceMatchInfo, input: VerifyEntranceFormData) => void;
  onBack: () => void;
}

export const EntranceLookupForm = ({
  defaultValues,
  onMatched,
  onBack,
}: EntranceLookupFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyEntranceFormData>({
    resolver: zodResolver(verifyEntranceSchema),
    defaultValues: {
      examYear: '',
      rollCode: '',
      rollNumber: '',
      fatherName: '',
      ...defaultValues,
    },
  });

  const verifyEntranceMutation = useVerifyEntranceMutation();

  const onSubmit = (data: VerifyEntranceFormData) => {
    verifyEntranceMutation.mutate(data, {
      onSuccess: (res) => {
        if (res.ok && res.data) {
          onMatched(res.data, data);
        }
      },
      onError: (error) => {
        const apiError = extractApiError(error) as ApiError;

        if (apiError.errors?.fieldErrors) {
          for (const [field, messages] of Object.entries(
            apiError.errors.fieldErrors,
          )) {
            if (
              field === 'examYear' ||
              field === 'rollCode' ||
              field === 'rollNumber' ||
              field === 'fatherName'
            ) {
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
        Back to login
      </button>

      <header className='mb-5 space-y-1.5'>
        <h1 className={authFormTitleClass}>First-year registration</h1>
        <p className={authFormSubtitleClass}>
          Enter your entrance exam details so we can find your record.
        </p>
      </header>

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
          <label htmlFor='entrance-exam-year' className={authFieldLabelClass}>
            Exam year
          </label>
          <div className='group relative'>
            <span className={`${authInputIconClass} material-symbols-outlined`}>
              calendar_month
            </span>
            <input
              id='entrance-exam-year'
              {...register('examYear')}
              className={authInputClass}
              type='text'
              inputMode='numeric'
              placeholder='၂၀၂၆'
            />
          </div>
          {errors.examYear && (
            <p className='ml-0.5 mt-1 text-xs font-medium text-error'>
              {errors.examYear.message}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <label htmlFor='entrance-roll-code' className={authFieldLabelClass}>
            Roll number
          </label>
          <div className='flex items-center gap-2'>
            <div className='group relative w-2/5'>
              <span
                className={`${authInputIconClass} material-symbols-outlined`}
              >
                tag
              </span>
              <input
                id='entrance-roll-code'
                {...register('rollCode')}
                className={authInputClass}
                type='text'
                placeholder='ဆလမ'
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <span className='text-lg font-semibold text-on-surface-variant'>
              -
            </span>
            <div className='group relative flex-1'>
              <span
                className={`${authInputIconClass} material-symbols-outlined`}
              >
                pin
              </span>
              <input
                id='entrance-roll-number'
                {...register('rollNumber')}
                className={authInputClass}
                type='text'
                inputMode='numeric'
                placeholder='၂၁၂'
              />
            </div>
          </div>
          <p className='ml-0.5 text-xs text-on-surface-variant'>
            Code (e.g. ဆလမ) and number (e.g. ၂၁၂)
          </p>
          {(errors.rollCode || errors.rollNumber) && (
            <p className='ml-0.5 mt-1 text-xs font-medium text-error'>
              {errors.rollCode?.message || errors.rollNumber?.message}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <label htmlFor='entrance-father-name' className={authFieldLabelClass}>
            Father&apos;s name
          </label>
          <div className='group relative'>
            <span className={`${authInputIconClass} material-symbols-outlined`}>
              family_restroom
            </span>
            <input
              id='entrance-father-name'
              {...register('fatherName')}
              className={authInputClass}
              type='text'
              placeholder='ဦး...'
            />
          </div>
          {errors.fatherName && (
            <p className='ml-0.5 mt-1 text-xs font-medium text-error'>
              {errors.fatherName.message}
            </p>
          )}
        </div>

        <button
          className={authSubmitButtonClass}
          type='submit'
          disabled={verifyEntranceMutation.isPending}
        >
          {verifyEntranceMutation.isPending ? (
            <>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent' />
              Searching...
            </>
          ) : (
            <>
              Find my record
              <span className='material-symbols-outlined text-base'>
                search
              </span>
            </>
          )}
        </button>
      </form>
    </AuthFormCard>
  );
};
