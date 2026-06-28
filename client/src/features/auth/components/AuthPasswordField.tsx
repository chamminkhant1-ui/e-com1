import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import {
  authFieldLabelClass,
  authInputIconClass,
  authInputWithToggleClass,
  authPasswordToggleClass,
} from './authFormStyles';

interface AuthPasswordFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  autoComplete?: 'current-password' | 'new-password';
}

export const AuthPasswordField = ({
  id,
  label,
  registration,
  error,
  autoComplete = 'current-password',
}: AuthPasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={authFieldLabelClass}>
        {label}
      </label>
      <div className="group relative">
        <span className={`${authInputIconClass} material-symbols-outlined`} aria-hidden>
          lock
        </span>
        <input
          id={id}
          {...registration}
          className={authInputWithToggleClass}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className={authPasswordToggleClass}
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
        >
          <span className="material-symbols-outlined text-[1.125rem] leading-none">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      {error && <p className="ml-0.5 mt-1 text-xs font-medium text-error">{error}</p>}
    </div>
  );
};
