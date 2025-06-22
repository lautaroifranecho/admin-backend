# Admin Dashboard Backend

A secure Node.js/TypeScript backend for an admin dashboard system with user management, email verification, and file import/export capabilities.

## 🚀 Features

- **User Management**: CRUD operations for users with verification system
- **Admin Authentication**: JWT-based authentication with 2FA support
- **Email System**: Automated verification emails with customizable templates
- **File Operations**: CSV/XLSX import and export functionality
- **Real-time Updates**: Socket.IO integration for live updates
- **Security**: Rate limiting, input sanitization, and audit logging
- **Database**: PostgreSQL with Supabase integration

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer with SMTP
- **File Processing**: Multer, xlsx, csv-parse
- **Real-time**: Socket.IO
- **Validation**: Zod
- **Security**: Helmet, express-rate-limit

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- SMTP email service (Gmail, SendGrid, etc.)

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_32_character_jwt_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com
ADMIN_EMAIL=admin@yourcompany.com

# Application
BASE_URL=http://localhost:3000
COMPANY_NAME=Your Company Name
```

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-dashboard-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   npm run setup-db
   ```

5. **Create admin user**
   ```bash
   npm run create-admin <email> <password>
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Authentication

#### POST `/api/auth/login`
Login with admin credentials.
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/setup`
Create the first admin user (only works if no admin exists).
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Admin Endpoints

All admin endpoints require authentication via JWT token in Authorization header.

#### GET `/api/admin/stats`
Get dashboard statistics.

#### GET `/api/admin/users`
Get paginated users list.
**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 50)
- `status` (string): Filter by status (pending/confirmed/updated)
- `search` (string): Search in name, email, client number

#### POST `/api/admin/import`
Import users from CSV/XLSX file.
**Form Data:**
- `file`: CSV or XLSX file
- `socketId`: Socket.IO client ID for progress updates

#### GET `/api/admin/export/csv`
Export all users to CSV.

#### GET `/api/admin/export/xlsx`
Export all users to XLSX.

#### POST `/api/admin/resend-email/:userId`
Resend verification email to specific user.

#### PUT `/api/admin/users/:id`
Update user information.

### Public Endpoints

#### GET `/api/verify/:token`
Verify user email with token.

#### GET `/health`
Health check endpoint.

## 🔒 Security Features

- **Rate Limiting**: Prevents brute force attacks
- **Input Sanitization**: Protects against XSS and injection
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Audit Logging**: Track all user actions

## 📁 Project Structure

```
├── server/
│   ├── routes/          # Route handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── config.ts        # Configuration
│   ├── db.ts           # Database connection
│   ├── storage.ts      # Data access layer
│   └── index.ts        # Server entry point
├── shared/
│   └── schema.ts       # Shared types and schemas
├── scripts/            # Setup and utility scripts
├── uploads/            # File upload directory
└── dist/              # Compiled JavaScript
```

## 🚀 Deployment

### Vercel
The project includes `vercel.json` configuration for easy deployment to Vercel.

### Manual Deployment
1. Build the project: `npm run build`
2. Start production server: `npm start`

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run create-admin` - Create admin user
- `npm run setup-db` - Set up database tables
- `npm run setup-2fa` - Set up 2FA for admin

### Code Quality

- TypeScript strict mode enabled
- ESLint configuration (recommended)
- Prettier formatting (recommended)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify Supabase credentials in `.env`
   - Ensure database tables are created

2. **Email Not Sending**
   - Check SMTP configuration
   - Verify email credentials
   - Test with `/api/admin/test-email`

3. **Build Errors**
   - Ensure TypeScript is installed: `npm install -g typescript`
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please open an issue in the repository or contact the development team.
