import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  otpSchema,
  type OtpFormData,
} from '@/features/auth/schemas/auth.schema';
import {
  useVerifyOtpMutation,
  useResetOtpMutation,
  extractApiError,
} from '@/features/auth/hooks/useAuthQueries';
import type { ApiError } from '@/types/api';
import { AuthFormCard } from './AuthFormCard';
import {
  authAlertErrorClass,
  authFormSubtitleClass,
  authFormTitleClass,
  authSubmitButtonClass,
} from './authFormStyles';

interface OtpVerificationProps {
  onBack: () => void;
  onVerified: () => void;
  email?: string;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const otpDigitClass =
  'h-11 w-9 rounded-lg border border-transparent bg-surface-container-high text-center text-lg font-bold text-on-surface transition-colors focus:border-primary-container/30 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/20 sm:h-12 sm:w-10 sm:text-xl';

export const OtpVerification = ({
  onBack,
  onVerified,
  email,
}: OtpVerificationProps) => {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const lastAutoSubmittedOtp = useRef<string | null>(null);

  const {
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: email ?? '', otp: '' },
  });

  const verifyMutation = useVerifyOtpMutation();
  const resetMutation = useResetOtpMutation();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const syncOtp = useCallback(
    (newDigits: string[]) => {
      const otp = newDigits.join('');
      setValue('otp', otp);
      if (otp.length === OTP_LENGTH) {
        clearErrors('otp');
      }
    },
    [setValue, clearErrors],
  );

  const onSubmit = useCallback(
    (data: OtpFormData) => {
      verifyMutation.mutate(data, {
        onSuccess: (res) => {
          if (res.ok) {
            onVerified();
          }
        },
        onError: (error) => {
          lastAutoSubmittedOtp.current = null;
          const apiError = extractApiError(error) as ApiError;
          if (apiError.message) {
            setError('otp', { message: apiError.message });
          }
          if (apiError.errors?.formErrors?.length) {
            setError('otp', { message: apiError.errors.formErrors[0] });
          }
        },
      });
    },
    [verifyMutation, onVerified, setError],
  );

  const tryAutoSubmit = useCallback(
    (newDigits: string[]) => {
      const otp = newDigits.join('');
      const isComplete =
        newDigits.length === OTP_LENGTH && newDigits.every((d) => d !== '');
      if (!isComplete) {
        lastAutoSubmittedOtp.current = null;
        return;
      }
      if (verifyMutation.isPending || lastAutoSubmittedOtp.current === otp) {
        return;
      }

      lastAutoSubmittedOtp.current = otp;
      setValue('otp', otp, { shouldValidate: true });
      void handleSubmit(onSubmit)();
    },
    [handleSubmit, onSubmit, setValue, verifyMutation.isPending],
  );

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    syncOtp(newDigits);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    tryAutoSubmit(newDigits);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newDigits = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    syncOtp(newDigits);

    const nextEmpty = newDigits.findIndex((d) => !d);
    const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();

    tryAutoSubmit(newDigits);
  };

  const handleResend = () => {
    if (cooldown > 0 || !email) return;
    resetMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setCooldown(RESEND_COOLDOWN);
          setDigits(Array(OTP_LENGTH).fill(''));
          setValue('otp', '');
          lastAutoSubmittedOtp.current = null;
          clearErrors();
          inputRefs.current[0]?.focus();
        },
        onError: (error) => {
          const apiError = extractApiError(error) as ApiError;
          setError('otp', {
            message: apiError.message ?? 'Failed to resend OTP',
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
        Back to login
      </button>

      <header className='mb-5 space-y-2 text-center'>
        <h2 className={authFormTitleClass}>Verify identity</h2>
        <p className={authFormSubtitleClass}>
          Enter the 6-digit code sent to{' '}
          <span className='font-semibold text-secondary'>
            {email || 'your university email'}
          </span>
          .
        </p>
      </header>

      {errors.otp && (
        <div className={authAlertErrorClass} role='alert'>
          <span className='material-symbols-outlined text-lg text-on-error-container'>
            error
          </span>
          <p className='text-sm font-medium text-on-error-container'>
            {errors.otp.message}
          </p>
        </div>
      )}

      <form className='space-y-5' onSubmit={handleSubmit(onSubmit)} noValidate>
        <div
          className='flex justify-center gap-1.5 sm:gap-2'
          onPaste={handlePaste}
          role='group'
          aria-label='One-time password'
        >
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              className={otpDigitClass}
              maxLength={1}
              type='text'
              inputMode='numeric'
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              value={digits[i]}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            />
          ))}
        </div>

        <div className='space-y-2.5'>
          <button
            className={authSubmitButtonClass}
            type='submit'
            disabled={verifyMutation.isPending}
          >
            {verifyMutation.isPending ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent' />
                Verifying...
              </>
            ) : (
              'Confirm identity'
            )}
          </button>

          <button
            className='flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/25 bg-surface-container-high py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40'
            type='button'
            onClick={handleResend}
            disabled={cooldown > 0 || resetMutation.isPending}
          >
            {resetMutation.isPending ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-on-surface-variant border-t-transparent' />
                Sending...
              </>
            ) : (
              <>
                <span className='material-symbols-outlined text-base'>
                  refresh
                </span>
                {cooldown > 0 ? `Resend OTP (${cooldown}s)` : 'Resend OTP'}
              </>
            )}
          </button>
        </div>
      </form>
    </AuthFormCard>
  );
};
