import { useState, useRef, useCallback, useEffect } from 'react';
import {
  useVerifyResetOtpMutation,
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

interface ResetOtpFormProps {
  email: string;
  onBack: () => void;
  onVerified: (otp: string) => void;
  onResend: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const otpDigitClass =
  'h-12 w-10 rounded-xl border-2 border-transparent bg-surface-container-high text-center text-xl font-bold text-on-surface transition-all focus:border-primary-container/60 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/20 sm:h-13 sm:w-11';

export const ResetOtpForm = ({
  email,
  onBack,
  onVerified,
  onResend,
}: ResetOtpFormProps) => {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = useVerifyResetOtpMutation();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
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
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
    setDigits(newDigits);
    setError('');
    const nextEmpty = newDigits.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const otp = digits.join('');
      if (otp.length < OTP_LENGTH) {
        setError('Please enter all 6 digits.');
        return;
      }
      verifyMutation.mutate(
        { email, otp },
        {
          onSuccess: () => onVerified(otp),
          onError: (err) => {
            const apiError = extractApiError(err) as ApiError;
            setError(apiError.message || 'Invalid OTP code. Please try again.');
            setDigits(Array(OTP_LENGTH).fill(''));
            setTimeout(() => inputRefs.current[0]?.focus(), 0);
          },
        },
      );
    },
    [digits, email, verifyMutation, onVerified],
  );



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

      <header className='mb-5 space-y-1.5 text-center'>
        <h1 className={authFormTitleClass}>Enter reset code</h1>
        <p className={authFormSubtitleClass}>
          We sent a 6-digit code to{' '}
          <span className='font-semibold text-secondary'>{email}</span>
        </p>
      </header>

      {error && (
        <div className={authAlertErrorClass} role='alert'>
          <span className='material-symbols-outlined text-lg text-on-error-container'>
            error
          </span>
          <p className='text-sm font-medium text-on-error-container'>{error}</p>
        </div>
      )}

      <form className='space-y-5' onSubmit={handleSubmit} noValidate>
        {/* OTP digit boxes */}
        <div
          className='flex justify-center gap-2'
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
            disabled={
              verifyMutation.isPending || digits.join('').length < OTP_LENGTH
            }
          >
            {verifyMutation.isPending ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent' />
                Verifying...
              </>
            ) : (
              <>
                Verify code
                <span className='material-symbols-outlined text-base'>
                  arrow_forward
                </span>
              </>
            )}
          </button>

          <button
            type='button'
            className='flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/25 bg-surface-container-high py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40'
            disabled={cooldown > 0}
            onClick={() => {
              onResend();
              setCooldown(RESEND_COOLDOWN);
              setDigits(Array(OTP_LENGTH).fill(''));
              setError('');
              setTimeout(() => inputRefs.current[0]?.focus(), 0);
            }}
          >
            <span className='material-symbols-outlined text-base'>refresh</span>
            {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
          </button>
        </div>
      </form>
    </AuthFormCard>
  );
};
