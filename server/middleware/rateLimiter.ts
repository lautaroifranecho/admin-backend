import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: {
    message: 'Too many file uploads, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const emailLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 3, 
  message: {
    message: 'Too many email resend requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
