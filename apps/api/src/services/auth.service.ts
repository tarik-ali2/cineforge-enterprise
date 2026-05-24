import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { Role } from '../models/Role.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { sha256 } from '../utils/crypto.js';
import { signAccessToken, signRefreshToken } from '../utils/tokens.js';

export async function buildAuthPayload(userId: string) {
  const user = await User.findById(userId).populate('roles').lean();
  if (!user) throw new Error('User not found');
  const roles = (user.roles as any[]).map((role) => role.key);
  const permissions = new Set<string>();
  for (const role of user.roles as any[]) {
    for (const permission of role.permissions ?? []) {
      if (permission.enabled) permissions.add(permission.key);
    }
  }
  return { sub: String(user._id), roles, permissions: [...permissions] };
}

export async function login(email: string, password: string, context: { ipHash?: string; userAgent?: string }) {
  const user = await User.findOne({ email: email.toLowerCase(), status: 'active' });
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, String(user.passwordHash));
  if (!ok) throw new Error('Invalid credentials');
  const payload = await buildAuthPayload(String(user._id));
  const sessionId = nanoid(32);
  const refreshToken = signRefreshToken({ sub: payload.sub, sessionId });
  await Session.create({
    userId: user._id,
    refreshTokenHash: sha256(refreshToken),
    deviceId: sessionId,
    ipHash: context.ipHash,
    userAgent: context.userAgent,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  user.lastLoginAt = new Date();
  await user.save();
  return { accessToken: signAccessToken(payload), refreshToken };
}

export async function ensureDefaultRoles() {
  const roles = [
    ['Super Admin', 'super_admin', ['*']],
    ['Admin', 'admin', ['manage_content', 'manage_media', 'manage_seo', 'manage_forms', 'manage_orders']],
    ['Editor', 'editor', ['manage_blogs', 'edit_content']],
    ['Marketing Manager', 'marketing_manager', ['manage_gtm', 'manage_pixels', 'manage_analytics', 'manage_campaigns']],
    ['Listing Manager', 'listing_manager', ['manage_listings']],
    ['Support Staff', 'support_staff', ['view_leads', 'view_orders', 'view_tickets']]
  ];
  for (const [name, key, permissions] of roles) {
    await Role.updateOne(
      { key },
      { $setOnInsert: { name, key, system: true, permissions: (permissions as string[]).map((p) => ({ key: p, enabled: true })) } },
      { upsert: true }
    );
  }
}
