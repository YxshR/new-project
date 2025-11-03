import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { User } from '../types';
import { generateToken } from '../utils/jwt';

export class AuthService {
  static async register(email: string, password: string, fullName?: string) {
    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, kyc_status, created_at`,
      [email, passwordHash, fullName || null]
    );

    const user = result.rows[0];

    // Create wallet for user
    await query(
      'INSERT INTO wallets (user_id, balance, currency) VALUES ($1, $2, $3)',
      [user.id, 0, 'INR']
    );

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    return { user, token };
  }

  static async login(email: string, password: string) {
    // Find user
    const result = await query(
      'SELECT id, email, password_hash, full_name, kyc_status FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  static async getUserById(userId: string) {
    const result = await query(
      'SELECT id, email, full_name, phone, kyc_status, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }
}
