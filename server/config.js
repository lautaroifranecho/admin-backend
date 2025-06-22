"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var zod_1 = require("zod");
var dotenv = require("dotenv");
// Load environment variables from .env file
dotenv.config();
// Environment variable schema
var envSchema = zod_1.z.object({
    // Database
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_ANON_KEY: zod_1.z.string().min(1),
    // Server
    PORT: zod_1.z.string().transform(Number).default('5000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    // JWT
    JWT_SECRET: zod_1.z.string().min(32),
    // Email
    SMTP_HOST: zod_1.z.string().default('smtp.gmail.com'),
    SMTP_PORT: zod_1.z.string().transform(Number).default('587'),
    SMTP_SECURE: zod_1.z.string().transform(function (val) { return val === 'true'; }).default('false'),
    SMTP_USER: zod_1.z.string().email(),
    SMTP_PASS: zod_1.z.string().min(1),
    FROM_EMAIL: zod_1.z.string().email(),
    ADMIN_EMAIL: zod_1.z.string().email(),
    // Application
    BASE_URL: zod_1.z.string().url(),
    COMPANY_NAME: zod_1.z.string().default('Your Company'),
});
// Parse and validate environment variables
var env = envSchema.parse(process.env);
// Export validated environment variables
exports.config = {
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
};
