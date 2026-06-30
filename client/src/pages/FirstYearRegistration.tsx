import { useState, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { EntranceLookupForm } from '@/features/auth/components/EntranceLookupForm';
import { EntranceConfirmCard } from '@/features/auth/components/EntranceConfirmCard';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { getAuthenticatedHomePath } from '@/routes/authPaths';
import type { EntranceMatchInfo } from '@/types/auth';
import type { VerifyEntranceFormData } from '@/features/auth/schemas/auth.schema';

type RegisterStep = 'lookup' | 'confirm' | 'register';

/**
 * Shared with the Login page so the OTP step is picked up after navigating to "/".
 */
const AUTH_FLOW_STORAGE_KEY = 'auth_flow_state';

const writeOtpFlowState = (email: string) => {
  try {
    sessionStorage.setItem(
      AUTH_FLOW_STORAGE_KEY,
      JSON.stringify({
        step: 'otp',
        registeredEmail: email,
        resetEmail: '',
        resetOtp: '',
      }),
    );
  } catch {
    // sessionStorage unavailable — the user can still log in manually
  }
};

export const FirstYearRegistration = () => {
  const { isLoading, isAuthenticated, user } = useAuthUser();
  const navigate = useNavigate();

  const [step, setStep] = useState<RegisterStep>('lookup');
  const [match, setMatch] = useState<EntranceMatchInfo | null>(null);
  const [entranceInput, setEntranceInput] = useState<VerifyEntranceFormData | null>(
    null,
  );

  const goLogin = useCallback(() => navigate('/', { replace: true }), [navigate]);

  const handleMatched = useCallback(
    (info: EntranceMatchInfo, input: VerifyEntranceFormData) => {
      setMatch(info);
      setEntranceInput(input);
      setStep('confirm');
    },
    [],
  );

  const handleRegistered = useCallback(
    (email: string) => {
      // Hand off to the Login route's OTP step (it reads auth_flow_state).
      writeOtpFlowState(email);
      navigate('/', { replace: true });
    },
    [navigate],
  );

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-8 w-8 animate-spin rounded-full border-[3px] border-primary-container border-t-transparent' />
          <p className='text-sm font-medium tracking-wide text-on-surface-variant'>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getAuthenticatedHomePath(user)} replace />;
  }

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-10 select-none'>
      <div className='flex w-full max-w-[340px] flex-col justify-center sm:max-w-[360px]'>
        {step === 'lookup' && (
          <EntranceLookupForm
            defaultValues={entranceInput ?? undefined}
            onMatched={handleMatched}
            onBack={goLogin}
          />
        )}

        {step === 'confirm' && match && (
          <EntranceConfirmCard
            info={match}
            onConfirm={() => setStep('register')}
            onBack={() => setStep('lookup')}
          />
        )}

        {step === 'register' && match && entranceInput && (
          <RegisterForm
            entrance={match}
            entranceInput={entranceInput}
            onBack={() => setStep('confirm')}
            onRegistered={handleRegistered}
          />
        )}
      </div>
    </div>
  );
};
