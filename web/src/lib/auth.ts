import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'safety_road_gh_jwt_secret_key_2026_ghana';
const SALT = 'safety_road_gh_salt';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'CITIZEN' | 'ADMIN' | 'RESPONDER';
  full_name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const computedHash = crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
  return computedHash === hash;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
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
