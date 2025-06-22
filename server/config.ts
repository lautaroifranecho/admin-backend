import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  
  PORT: z.string().transform(Number).default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  JWT_SECRET: z.string().min(32),
  
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_SECURE: z.string().transform(val => val === 'true').default('false'),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  FROM_EMAIL: z.string().email(),
  ADMIN_EMAIL: z.string().email(),
  
  BASE_URL: z.string().url(),
  COMPANY_NAME: z.string().default('Your Company'),
});

const env = envSchema.parse(process.env);

export const config = {
  db: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
  },
  server: {
    port: env.PORT,
    env: env.NODE_ENV,
  },
  jwt: {
    secret: env.JWT_SECRET,
  },
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    from: env.FROM_EMAIL,
    admin: env.ADMIN_EMAIL,
  },
  app: {
    baseUrl: env.BASE_URL,
    companyName: env.COMPANY_NAME,
  },
} as const;

export type Config = typeof config; 