import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName } = registerSchema.parse(req.body);

      const result = await AuthService.register(email, password, fullName);

      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const result = await AuthService.login(email, password);

      res.json({
        message: 'Login successful',
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async getProfile(req: any, res: Response) {
    try {
      const user = await AuthService.getUserById(req.user.userId);
      res.json({ user });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
