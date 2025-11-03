import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (payload: JWTPayload): string => {
  const expiresIn = (process.env.JWT_EXPIRY || '7d') as any;
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
