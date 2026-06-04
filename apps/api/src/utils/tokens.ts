import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type JwtUser = { sub: string; roles: string[]; permissions: string[] };

export function signAccessToken(payload: JwtUser) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '24h' });
}

export function signRefreshToken(payload: { sub: string; sessionId: string }) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUser;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; sessionId: string };
}
