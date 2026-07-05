import { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { OtpVerification } from '@/features/auth/components/OtpVerification';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { ResetOtpForm } from '@/features/auth/components/ResetOtpForm';
import { NewPasswordForm } from '@/features/auth/components/NewPasswordForm';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { getAuthenticatedHomePath } from '@/routes/authPaths';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type AuthStep =
  | 'login'
  | 'otp'
  | 'forgot-password'
  | 'reset-otp'
  | 'new-password';

const STORAGE_KEY = 'auth_flow_state';

interface AuthFlowState {
  step: AuthStep;
  registeredEmail: string;
  resetEmail: string;
  resetOtp: string;
}

const VALID_STEPS: AuthStep[] = [
  'login',
  'otp',
  'forgot-password',
  'reset-otp',
  'new-password',
];

/** Restore persisted auth flow state from sessionStorage, falling back to defaults. */
const loadFlowState = (): AuthFlowState => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthFlowState>;
      const step = VALID_STEPS.includes(parsed.step as AuthStep)
        ? (parsed.step as AuthStep)
        : 'login';

      // If we're on a step that requires data but data is missing, fall back to a safe step
      if (
        (step === 'otp' && !parsed.registeredEmail) ||
        (step === 'reset-otp' && !parsed.resetEmail) ||
        (step === 'new-password' && (!parsed.resetEmail || !parsed.resetOtp))
      ) {
        return {
          step: 'login',
          registeredEmail: '',
          resetEmail: '',
          resetOtp: '',
        };
      }

      return {
        step,
        registeredEmail: parsed.registeredEmail || '',
        resetEmail: parsed.resetEmail || '',
        resetOtp: parsed.resetOtp || '',
      };
    }
  } catch {
    // Corrupted storage — ignore
  }
  return { step: 'login', registeredEmail: '', resetEmail: '', resetOtp: '' };
};

const saveFlowState = (state: AuthFlowState) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — fail silently
  }
};

const clearFlowState = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
};

export const Login = () => {
  const { isLoading, isAuthenticated, user } = useAuthUser();

  const [flowState, setFlowStateRaw] = useState<AuthFlowState>(loadFlowState);
  const [successMessage, setSuccessMessage] = useState('');

  /** Update flow state and persist to sessionStorage in one call. */
  const setFlowState = useCallback((update: Partial<AuthFlowState>) => {
    setFlowStateRaw((prev) => {
      const next = { ...prev, ...update };
      saveFlowState(next);
      return next;
    });
  }, []);

  /** Reset flow to login and clear sessionStorage. */
  const resetToLogin = useCallback((message?: string) => {
    clearFlowState();
    setFlowStateRaw({
      step: 'login',
      registeredEmail: '',
      resetEmail: '',
      resetOtp: '',
    });
    if (message) setSuccessMessage(message);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user) {
    clearFlowState();
    return <Navigate to={getAuthenticatedHomePath(user)} replace />;
  }

  const { step, registeredEmail, resetEmail, resetOtp } = flowState;

  const handleOtpVerified = () => {
    resetToLogin('Email verified successfully! You can now sign in.');
  };

  const handleForgotPasswordOtpSent = (email: string) => {
    setFlowState({ step: 'reset-otp', resetEmail: email });
  };

  const handleResetOtpVerified = (otp: string) => {
    setFlowState({ step: 'new-password', resetOtp: otp });
  };

  const handlePasswordResetSuccess = () => {
    resetToLogin(
      'Password reset successful! You can now sign in with your new password.',
    );
  };

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-10 select-none'>
      <div className='flex w-full max-w-[340px] flex-col justify-center sm:max-w-[360px]'>
        {step === 'login' && (
          <LoginForm
            onNavigateToForgotPassword={() => {
              setSuccessMessage('');
              setFlowState({ step: 'forgot-password' });
            }}
            successMessage={successMessage}
          />
        )}

        {step === 'otp' && (
          <OtpVerification
            email={registeredEmail}
            onBack={() => resetToLogin()}
            onVerified={handleOtpVerified}
          />
        )}

        {step === 'forgot-password' && (
          <ForgotPasswordForm
            onBack={() => resetToLogin()}
            onOtpSent={handleForgotPasswordOtpSent}
          />
        )}

        {step === 'reset-otp' && (
          <ResetOtpForm
            email={resetEmail}
            onBack={() => setFlowState({ step: 'forgot-password' })}
            onVerified={handleResetOtpVerified}
            onResend={() => setFlowState({ step: 'forgot-password' })}
          />
        )}

        {step === 'new-password' && (
          <NewPasswordForm
            email={resetEmail}
            otp={resetOtp}
            onBack={() => setFlowState({ step: 'reset-otp', resetOtp: '' })}
            onSuccess={handlePasswordResetSuccess}
          />
        )}
      </div>
    </div>
  );
};
