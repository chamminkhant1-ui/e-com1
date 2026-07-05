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
  const [lastEmail, setLastEmail] = useState(email);
  const [apiResult, setApiResult] = useState<EmailValidationResult | null>(null);

  // Sync state if email changes during rendering
  if (email !== lastEmail) {
    setLastEmail(email);
    setApiResult(null);
  }

  useEffect(() => {
    if (!email) return;

    const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!regex.test(email)) return;

    let active = true;

    const timer = setTimeout(() => {
      fetch('/api/locations/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (!active) return;
          if (!d.is_valid) {
            setApiResult({ text: 'Invalid email format.', color: 'text-red-600' });
          } else if (!d.is_verified) {
            setApiResult({ text: 'Email domain/server not verified.', color: 'text-orange-500' });
          } else {
            setApiResult({ text: 'Valid and verified email. ✓', color: 'text-green-600' });
          }
        })
        .catch(() => {
          if (!active) return;
          setApiResult({ text: 'Error checking email.', color: 'text-red-600' });
        });
    }, 600);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [email]);

  // Synchronously compute validation results during render
  if (!email) {
    return { text: '', color: '' };
  }

  const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (!regex.test(email)) {
    return { text: 'Invalid email format.', color: 'text-red-600' };
  }

  if (apiResult) {
    return apiResult;
  }

  return { text: 'Checking...', color: 'text-gray-500' };
};
