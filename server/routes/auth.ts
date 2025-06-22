import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { loginSchema } from '@shared/schema';
import { storage } from '../storage';
import { config } from '../config';
import { authMiddleware as authenticateToken, type AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const admin = await storage.getAdminByEmail(email);
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
    console.error("Login error:", error);
    return res.status(400).json({ message: "Invalid request data" });
  }
});

router.post('/verify-2fa', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    const adminId = req.admin?.adminId;

    if (!adminId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const securitySettings = await storage.getUserSecurity(adminId);
    if (!securitySettings || !securitySettings.two_factor_enabled || !securitySettings.two_factor_secret) {
      return res.status(400).json({ message: "2FA is not enabled for this account." });
    }

    const isValid = authenticator.verify({
      token: code,
      secret: securitySettings.two_factor_secret,
    });

    if (!isValid) {
      return res.status(401).json({ message: "Invalid 2FA code." });
    }

    const token = jwt.sign({ adminId: req.admin!.adminId, email: req.admin!.email }, config.jwt.secret, {
      expiresIn: "24h"
    });

    return res.json({ token });

  } catch (error) {
    console.error("2FA verification error:", error);
    return res.status(500).json({ message: "Internal server error during 2FA verification." });
  }
});

export default router; 