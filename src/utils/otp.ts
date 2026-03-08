import crypto from "crypto";

/**
 * Generate a 6-digit OTP
 * @returns 6-digit OTP as a string
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Get OTP expiry date (24 hours from now)
 * @returns Date object 24 hours in the future
 */
export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

/**
 * Check if OTP is expired
 * @param expiryDate - The OTP expiry date
 * @returns true if expired, false otherwise
 */
export function isOTPExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}

/**
 * Verify OTP
 * @param inputOtp - OTP provided by user
 * @param storedOtp - OTP stored in database
 * @param expiryDate - OTP expiry date
 * @returns true if OTP is valid, false otherwise
 */
export function verifyOTP(
  inputOtp: string,
  storedOtp: string | null,
  expiryDate: Date | null
): boolean {
  if (!storedOtp || !expiryDate) return false;
  if (isOTPExpired(expiryDate)) return false;
  return inputOtp === storedOtp;
}

/**
 * Hash OTP for secure storage (optional, but recommended)
 * @param otp - Plain text OTP
 * @returns Hashed OTP
 */
export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Verify hashed OTP
 * @param inputOtp - Plain text OTP from user
 * @param hashedOtp - Hashed OTP from database
 * @param expiryDate - OTP expiry date
 * @returns true if OTP is valid, false otherwise
 */
export function verifyHashedOTP(
  inputOtp: string,
  hashedOtp: string | null,
  expiryDate: Date | null
): boolean {
  if (!hashedOtp || !expiryDate) return false;
  if (isOTPExpired(expiryDate)) return false;
  return hashOTP(inputOtp) === hashedOtp;
}
