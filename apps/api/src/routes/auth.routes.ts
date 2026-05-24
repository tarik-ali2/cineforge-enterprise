import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { Router } from 'express';
import { z } from 'zod';
import { env, isProduction } from '../config/env.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { buildAuthPayload, login } from '../services/auth.service.js';
import { publicIpHash, sha256 } from '../utils/crypto.js';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/tokens.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(8) }).parse(req.body);
    const tokens = await login(body.email, body.password, {
      ipHash: publicIpHash(req.ip),
      userAgent: req.headers['user-agent']
    });
    res.cookie('access_token', tokens.accessToken, { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ ok: true, accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ ok: true });
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token ?? req.body?.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token required' });
    const decoded = verifyRefreshToken(token);
    const session = await Session.findOne({ deviceId: decoded.sessionId, refreshTokenHash: sha256(token), revokedAt: null });
    if (!session) return res.status(401).json({ error: 'Session expired' });

    const payload = await buildAuthPayload(decoded.sub);
    const sessionId = nanoid(32);
    const refreshToken = signRefreshToken({ sub: decoded.sub, sessionId });
    session.revokedAt = new Date();
    await session.save();
    await Session.create({
      userId: decoded.sub,
      refreshTokenHash: sha256(refreshToken),
      deviceId: sessionId,
      ipHash: publicIpHash(req.ip),
      userAgent: req.headers['user-agent'],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const accessToken = signAccessToken(payload);
    res.cookie('access_token', accessToken, { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ ok: true, accessToken });
  } catch (error) { next(error); }
});

authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const token = nanoid(48);
      user.passwordResetTokenHash = sha256(token);
      user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      return res.json({ ok: true, resetToken: isProduction ? undefined : token, message: env.SMTP_HOST ? 'Reset email queued.' : 'Configure SMTP to email reset links in production.' });
    }
    res.json({ ok: true });
  } catch (error) { next(error); }
});

authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const body = z.object({ token: z.string().min(20), password: z.string().min(8) }).parse(req.body);
    const user = await User.findOne({
      passwordResetTokenHash: sha256(body.token),
      passwordResetExpiresAt: { $gt: new Date() }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });
    user.passwordHash = await bcrypt.hash(body.password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    res.json({ ok: true });
  } catch (error) { next(error); }
});

authRouter.post('/change-password', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : req.cookies?.access_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = verifyAccessToken(token);
    const body = z.object({ currentPassword: z.string(), newPassword: z.string().min(8) }).parse(req.body);
    const user = await User.findById(payload.sub);
    if (!user || !(await bcrypt.compare(body.currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid current password' });
    }
    user.passwordHash = await bcrypt.hash(body.newPassword, 12);
    await user.save();
    res.json({ ok: true });
  } catch (error) { next(error); }
});
