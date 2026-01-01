// src/lib/otp-utils.ts

/**
 * OTP Utilities - Production Ready
 */

import crypto from 'crypto';

/**
 * Generate secure random OTP (more secure than Math.random)
 */
export function generateOTP(length: number = 5): string {
  if (length < 4 || length > 10) {
    throw new Error('OTP length must be between 4 and 10');
  }

  const digits = '0123456789';
  let otp = '';

  // Use crypto for better randomness (server-side safe)
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    const randomIndex = bytes[i] % 10;
    otp += digits[randomIndex];
  }

  return otp;
}

/**
 * Format standard OTP message (consistent across app)
 */
export function formatOTPMessage(otp: string, expiryMinutes: number = 2): string {
  return `Your verification code is ${otp}. It is valid for ${expiryMinutes} minute${expiryMinutes !== 1 ? 's' : ''}. Do not share with anyone. - SOOQRA`;
}

/**
 * Calculate OTP expiry Date
 */
export function getOTPExpiryDate(minutes: number = 2): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Validate OTP format (only digits, correct length)
 */
export function isValidOTPFormat(otp: string, length: number = 5): boolean {
  const regex = new RegExp(`^\\d{${length}}$`);
  return regex.test(otp);
}