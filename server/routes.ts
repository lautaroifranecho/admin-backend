import express, { Express, Request, Response, NextFunction } from "express";
import { createServer, Server } from "http";
import { Server as SocketServer } from "socket.io";
import multer from "multer";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import authRouter from './routes/auth';
import { storage } from "./storage";
import { updateUserSchema, loginSchema, User, InsertUser } from "@shared/schema";
import { sendVerificationEmail, testEmailConfiguration } from "./services/email";
import { processCSVFile } from "./services/fileUpload";
import { exportToCSV, exportToXLSX } from "./services/fileExport";
import { generateSecureToken, generateTokenExpiry, sanitizeInput, validateEmail, getSecurityHeaders } from "./services/security";
import { loginLimiter, uploadLimiter } from "./middleware/rateLimiter";
import { authMiddleware as authenticateToken } from "./middleware/auth";
import { sendAdminAlert } from "./services/email";
import { config } from "./config";
import fs from "fs";
import type { AuthRequest } from "./middleware/auth";
import cors from "cors";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    cb(null, allowedTypes.includes(ext));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);
  const io = new SocketServer(server, {
    cors: {
      origin: config.app.baseUrl,
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  app.set('io', io);

  app.use(helmet());
  app.use(cors({
    origin: config.app.baseUrl,
    credentials: true,
  }));
  app.use(express.json());

  app.use('/api/auth', authRouter);
    
  app.post("/api/auth/login", loginLimiter, async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      console.log(email, password);
      const cleanEmail = sanitizeInput(email);
      
      if (!validateEmail(cleanEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      const admin = await storage.getAdminByEmail(cleanEmail);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ adminId: admin.id, email: admin.email }, config.jwt.secret, {
        expiresIn: "24h"
      });

      return res.json({ token, admin: { id: admin.id, email: admin.email } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      return res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/setup", async (req, res) => {
    try {
      const adminCount = await storage.getAdminCount();
      if (adminCount > 0) {
        return res.status(403).json({ message: "Admin already exists" });
      }

      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      
      const admin = await storage.createAdmin({
        email: sanitizeInput(email),
        password: hashedPassword
      });

      return res.json({ message: "Admin created successfully", adminId: admin.id });
    } catch (error) {
      console.error("Admin creation error:", error);
      return res.status(400).json({ message: "Failed to create admin" });
    }
  });

  app.use("/api/admin/*", authenticateToken);

  app.get("/api/admin/test-email", async (_req, res) => {
    try {
      const isEmailConfigured = await testEmailConfiguration();
      if (isEmailConfigured) {
        return res.json({ 
          message: "Email configuration is valid", 
          configured: true,
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || '587',
          user: process.env.SMTP_USER || 'Not configured'
        });
      } else {
        return res.status(500).json({ 
          message: "Email configuration is invalid", 
          configured: false,
          error: "Please check your SMTP settings"
        });
      }
    } catch (error) {
      console.error("Email configuration test failed:", error);
      return res.status(500).json({ 
        message: "Email configuration test failed", 
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/admin/resend-email/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log('Manually resending verification email to:', user.email);
      
      try {
        await sendVerificationEmail(user);
        console.log('Verification email sent successfully to:', user.email);
        return res.json({ 
          message: "Verification email sent successfully",
          user: { 
            id: user.id, 
            email: user.email, 
            name: `${user.first_name} ${user.last_name}`.trim() 
          }
        });
      } catch (emailError) {
        console.error('Failed to send verification email to:', user.email, 'Error:', emailError);
        return res.status(500).json({ 
          message: "Failed to send verification email",
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        });
      }
    } catch (error) {
      console.error("Resend email error:", error);
      return res.status(500).json({ message: "Failed to resend email" });
    }
  });

  app.get("/api/admin/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      return res.json(stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      return res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
      const status = req.query.status as string;
      const search = req.query.search as string;

      const result = await storage.getUsers({ 
        page, 
        limit, 
        status: status ? sanitizeInput(status) : undefined, 
        search: search ? sanitizeInput(search) : undefined 
      });
      return res.json(result);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/import", uploadLimiter, upload.single('file'), async (req: MulterRequest, res: Response) => {
    try {
      console.log('Import request received');
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const socketId = req.body.socketId;
      const io = req.app.get('io') as SocketServer;

      const users = await processCSVFile(req.file.path, req.file.originalname);
      const totalUsers = users.length;
      const importResults = [];

      for (let i = 0; i < totalUsers; i++) {
        const userData = users[i];
        try {
          console.log('Processing user:', userData.email);
          
          const sanitizedData = {
            first_name: sanitizeInput(userData.first_name),
            last_name: sanitizeInput(userData.last_name),
            email: sanitizeInput(userData.email),
            address: sanitizeInput(userData.address),
            client_number: sanitizeInput(userData.client_number),
            phone_number: sanitizeInput(userData.phone_number),
            alt_number: userData.alt_number ? sanitizeInput(userData.alt_number) : null,
            group_template: userData.group_template ? sanitizeInput(userData.group_template) : null
          };

          console.log('Sanitized data:', sanitizedData);

          if (!validateEmail(sanitizedData.email)) {
            throw new Error("Invalid email format");
          }

          let user = await storage.getUserByEmail(sanitizedData.email);
          if (!user) {
            user = await storage.getUserByClientNumber(sanitizedData.client_number);
          }

          if (user) {
            console.log('Updating existing user:', user.id);
            const updatedUser = await storage.updateUser(user.id, {
              ...sanitizedData,
              has_changes: true
            });
            importResults.push({ status: 'updated', user: updatedUser });
          } else {
            console.log('Creating new user:', sanitizedData.email);
            const verificationToken = generateSecureToken();
            const tokenExpiry = generateTokenExpiry();
            
            const newUser = await storage.createUser({
              ...sanitizedData,
              verification_token: verificationToken,
              token_expiry: tokenExpiry.toISOString(),
              });
            
            importResults.push({ status: 'created', user: newUser });
          }
        } catch (error) {
          console.error('Error processing user:', error);
          importResults.push({
            status: 'error',
            data: userData,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        if (socketId && io) {
          const progress = ((i + 1) / totalUsers) * 100;
          io.to(socketId).emit('import_progress', { progress });
        }
      }
      
      console.log('Import completed. Results:', importResults);
      
      try {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log('Uploaded file cleaned up');
        }
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded file:", cleanupError);
      }

      const successful = importResults.filter(r => r.status === 'created' || r.status === 'updated').length;
      const failed = importResults.filter(r => r.status === 'error').length;

      console.log('Import summary - Successful:', successful, 'Failed:', failed);

      if (successful > 0) {
        try {
          console.log('Starting bulk update of all users to pending status after import...');
          
          const { updatedCount, users } = await storage.updateAllUsersToPending();
          
          console.log(`Updated ${updatedCount} users to pending status. Sending verification emails...`);

          let emailsSent = 0;
          let emailsFailed = 0;
          const emailErrors: Array<{ email: string; error: string }> = [];

          for (const user of users) {
            try {
              await sendVerificationEmail(user);
              emailsSent++;
              console.log(`Verification email sent to: ${user.email}`);
            } catch (error) {
              emailsFailed++;
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              emailErrors.push({ email: user.email, error: errorMessage });
              console.error(`Failed to send verification email to ${user.email}:`, errorMessage);
            }
          }

          console.log(`Bulk update completed after import. Updated: ${updatedCount}, Emails sent: ${emailsSent}, Failed: ${emailsFailed}`);

          return res.json({ 
            message: "Import completed and all users updated", 
            results: importResults,
            successful,
            failed,
            bulkUpdate: {
              updatedCount,
              emailsSent,
              emailsFailed,
              emailErrors
            }
          });

        } catch (bulkUpdateError) {
          console.error("Bulk update after import failed:", bulkUpdateError);
          
          let errorMessage = 'Unknown error';
          if (bulkUpdateError instanceof Error) {
            errorMessage = bulkUpdateError.message;
          } else if (typeof bulkUpdateError === 'object' && bulkUpdateError !== null) {
            errorMessage = JSON.stringify(bulkUpdateError);
          } else if (bulkUpdateError) {
            errorMessage = String(bulkUpdateError);
          }

          return res.json({ 
            message: "Import completed but bulk update failed", 
            results: importResults,
            successful,
            failed,
            bulkUpdateError: errorMessage
          });
        }
      } else {
      return res.json({ 
        message: "Import completed", 
        results: importResults,
        successful,
        failed
      });
      }
    } catch (error) {
      console.error("Import failed:", error);
      
      try {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded file:", cleanupError);
      }

      return res.status(500).json({ message: "Import failed" });
    }
  });

  app.get("/api/verify/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      console.log(token);
      const user = await storage.getUserByToken(token);
      if (!user) {
        return res.status(404).json({ message: "Invalid or expired verification link" });
      }
      return res.json({ user });
    } catch (error) {
      console.error("Verification lookup failed:", error);
      return res.status(500).json({ message: "Failed to verify user" });
    }
  });

  app.post("/api/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const user = await storage.getUserByToken(token);
      if (!user) {
        return res.status(404).json({ message: "Invalid or expired verification link" });
      }
  
      const updateData = updateUserSchema.parse(req.body);
  
      function normalizeValue(val: any) {
        return val === null || val === undefined ? "" : val;
      }

      const hasChanges = (Object.keys(updateData) as (keyof typeof updateData)[]).some(
        (key) => {
          const u = user as any;
          const u_update = updateData as any;
          return normalizeValue(u_update[key]) !== normalizeValue(u[key]);
        }
      );
  
      const updatedUser = await storage.updateUser(user.id, {
        ...updateData,
        status: hasChanges ? "updated" : "confirmed",
        last_updated: new Date().toISOString(),
      });
  
      if (hasChanges) {
        await sendAdminAlert(updatedUser, { oldData: user, newData: updateData });
      }
  
      return res.json({ message: "User info updated", user: updatedUser, hasChanges });
    } catch (error) {
      console.error("Verification update failed:", error);
      return res.status(400).json({ message: "Failed to update user info" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const adminId = req.admin?.adminId;
      if (!adminId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const admin = await storage.getAdminByEmail(req.admin!.email);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      return res.json({ admin: { id: admin.id, email: admin.email } });
    } catch (error) {
      console.error("Failed to get current admin:", error);
      return res.status(500).json({ message: "Failed to get current admin" });
    }
  });

  app.patch("/api/admin/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { group_template } = req.body;
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUser(userId, { group_template });
      return res.json({ message: "Group template updated", user: updatedUser });
    } catch (error) {
      console.error("Failed to update group template:", error);
      return res.status(500).json({ message: "Failed to update group template" });
    }
  });

  app.put("/api/admin/users/:userId", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID." });
      }

      const userData = updateUserSchema.parse(req.body);

      const updatedUser = await storage.updateUser(userId, {
        ...userData,
        alt_number: userData.alt_number || null,
      });

      return res.json({ message: "User updated successfully.", user: updatedUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data provided.", errors: error.errors });
      }
      console.error("Failed to update user:", error);
      return res.status(500).json({ message: "Failed to update user." });
    }
  });

  app.get("/api/admin/export", authenticateToken, async (req, res) => {
    try {
        const format = req.query.format as string || 'csv';

        const users = await storage.getAllUsers();

        if (format === 'xlsx') {
            const buffer = exportToXLSX(users);
            const fileName = `user_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            return res.send(buffer);
        } else {
            const csvData = exportToCSV(users);
            const fileName = `user_export_${new Date().toISOString().split('T')[0]}.csv`;
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Type', 'text/csv');
            return res.send(csvData);
        }

    } catch (error) {
        console.error("Failed to export users:", error);
        return res.status(500).json({ message: "Failed to export users." });
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Not Found" });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
  });

  return server;
}
