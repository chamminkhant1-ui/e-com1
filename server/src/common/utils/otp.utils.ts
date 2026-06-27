/**
 * Generates a random 6-digit numeric OTP code as a string.
 * @returns A 6-digit string.
 */
export const generateOtp = (): string => {
  // Generate a number between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

/**
 * Defines the expiration time for the OTP (e.g., 10 minutes from now).
 * @returns A Date object representing the expiration time.
 */
export const getOtpExpiration = (): Date => {
  const tenMinutesInMilliseconds = 10 * 60 * 1000;
  return new Date(Date.now() + tenMinutesInMilliseconds);
};