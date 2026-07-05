/**
 * Single source of truth for ASCII ↔ Myanmar digit conversion.
 * Prevents the same logic being duplicated across NrcInput, AddressSelector,
 * StudentRegistrationForm, and StudentPersonalAndMatriSection.
 */

const MYANMAR_DIGITS = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'] as const;

/** Convert ASCII digits (0-9) in a string to Myanmar digits (၀-၉). */
export const toMyanmarDigits = (s: string): string =>
  s.replace(/[0-9]/g, (d) => MYANMAR_DIGITS[Number(d)]);

/** Convert a number to its Myanmar-digit string representation. */
export const toMyanmarNumber = (n: number): string =>
  String(n).replace(/[0-9]/g, (d) => MYANMAR_DIGITS[Number(d)]);
