import { useState, useEffect } from 'react';

interface EmailValidationResult {
  /** Human-readable message (empty when idle) */
  text: string;
  /** Tailwind text color class */
  color: string;
}

/**
 * Debounced email validation: checks format locally then verifies the
 * domain via `/api/locations/check-email`.
 */
export const useEmailValidation = (email: string): EmailValidationResult => {
  const [result, setResult] = useState<EmailValidationResult>({ text: '', color: '' });

  useEffect(() => {
    if (!email) {
      setResult({ text: '', color: '' });
      return;
    }

    const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!regex.test(email)) {
      setResult({ text: 'Invalid email format.', color: 'text-red-600' });
      return;
    }

    setResult({ text: 'Checking...', color: 'text-gray-500' });
    const timer = setTimeout(() => {
      fetch('/api/locations/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (!d.is_valid)
            setResult({ text: 'Invalid email format.', color: 'text-red-600' });
          else if (!d.is_verified)
            setResult({ text: 'Email domain/server not verified.', color: 'text-orange-500' });
          else
            setResult({ text: 'Valid and verified email. ✓', color: 'text-green-600' });
        })
        .catch(() =>
          setResult({ text: 'Error checking email.', color: 'text-red-600' }),
        );
    }, 600);

    return () => clearTimeout(timer);
  }, [email]);

  return result;
};
