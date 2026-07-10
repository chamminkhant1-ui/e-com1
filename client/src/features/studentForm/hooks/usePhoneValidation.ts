interface PhoneValidationResult {
  /** Human-readable validation message */
  text: string;
  /** Tailwind text color class */
  color: string;
}

/**
 * Validates phone numbers locally: checks if they contain only 8 to 11 English digits.
 */
export const usePhoneValidation = (phone: string): PhoneValidationResult => {
  if (!phone) {
    return { text: '', color: '' };
  }

  const regex = /^[0-9]{8,11}$/;
  if (!regex.test(phone)) {
    return { text: 'Invalid phone format.', color: 'text-red-600' };
  }

  return { text: 'Valid phone format. ✓', color: 'text-green-600' };
};
