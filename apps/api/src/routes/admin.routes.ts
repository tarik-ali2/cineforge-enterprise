import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { Role } from '../models/Role.js';
import { AuditLog, Setting } from '../models/System.js';
import { User } from '../models/User.js';

export const adminRouter = Router();
adminRouter.use(requireAuth);

adminRouter.get('/me', async (req, res) => {
  res.json({ user: req.user });
});

adminRouter.get('/users', requirePermission('manage_users'), async (_req, res) => {
  res.json(await User.find().select('-passwordHash').populate('roles').sort({ createdAt: -1 }).lean());
});

adminRouter.get('/roles', requirePermission('manage_roles'), async (_req, res) => {
  res.json(await Role.find().sort({ system: -1, name: 1 }).lean());
});

adminRouter.post('/roles', requirePermission('manage_roles'), async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().min(2),
      key: z.string().min(2),
      permissions: z.array(z.object({ key: z.string(), enabled: z.boolean().default(true) })).default([])
    }).parse(req.body);
    res.status(201).json(await Role.create(body));
  } catch (error) { next(error); }
});

adminRouter.get('/settings', requirePermission('manage_settings'), async (_req, res) => {
  res.json(await Setting.find().sort({ group: 1, key: 1 }).lean());
});

adminRouter.put('/settings/:group/:key', requirePermission('manage_settings'), async (req, res) => {
  res.json(await Setting.findOneAndUpdate(
    { group: req.params.group, key: req.params.key },
    { value: req.body.value, secure: Boolean(req.body.secure) },
    { new: true, upsert: true }
  ));
});

adminRouter.get('/audit-logs', requirePermission('manage_settings'), async (_req, res) => {
  res.json(await AuditLog.find().sort({ createdAt: -1 }).limit(200).lean());
});
