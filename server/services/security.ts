import crypto from 'crypto';
import validator from 'validator';

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateTokenExpiry(): Date {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return validator.escape(input.trim());
}

export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true; 
  
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleanPhone);
}

export function validateZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function hashData(data: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, 'sha512');
  return `${actualSalt}:${hash.toString('hex')}`;
}

export function verifyHashedData(data: string, hashedData: string): boolean {
  const [salt, hash] = hashedData.split(':');
  const verifyHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512');
  return hash === verifyHash.toString('hex');
}

export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;",
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

export function createAuditLogEntry(
  userId: number,
  action: string,
  oldData?: any,
  newData?: any,
  ipAddress?: string,
  userAgent?: string
) {
  return {
    userId,
    action,
    oldData: oldData ? JSON.stringify(oldData) : null,
    newData: newData ? JSON.stringify(newData) : null,
    ipAddress: ipAddress || 'unknown',
    userAgent: userAgent || 'unknown'
  };
}
