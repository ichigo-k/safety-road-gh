import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const SALT = process.env.PASSWORD_SALT || 'local-only-safety-road-salt';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be configured in production');
  return 'local-only-safety-road-secret';
}

export type UserRole = 'CITIZEN' | 'ADMIN' | 'RESPONDER';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export function normalizeRole(role: string): UserRole {
  return role === 'ADMIN' ? 'ADMIN' : role === 'RESPONDER' ? 'RESPONDER' : 'CITIZEN';
}

export async function hashPassword(password: string): Promise<string> {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const computedHash = crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
  return computedHash === hash;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getAuthTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function verifyRequestAuth(req: NextRequest): TokenPayload | null {
  const token = getAuthTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}
