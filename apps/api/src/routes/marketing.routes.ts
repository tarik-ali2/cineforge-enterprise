import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { AnalyticsEvent, Lead, TrackingScript } from '../models/Marketing.js';
import { publicIpHash } from '../utils/crypto.js';

export const marketingRouter = Router();

marketingRouter.post('/track', async (req, res, next) => {
  try {
    const body = z.object({
      sessionId: z.string().min(1),
      eventName: z.string().min(1),
      pageUrl: z.string().optional(),
      referrer: z.string().optional(),
      metadata: z.any().optional()
    }).parse(req.body);
    await AnalyticsEvent.create({
      ...body,
      ipHash: publicIpHash(req.ip),
      userAgent: req.headers['user-agent']
    });
    res.json({ ok: true });
  } catch (error) { next(error); }
});

marketingRouter.post('/leads', async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      source: z.string().optional(),
      utm: z.any().optional()
    }).parse(req.body);
    res.status(201).json(await Lead.create(body));
  } catch (error) { next(error); }
});

marketingRouter.get('/analytics/summary', requireAuth, requirePermission('manage_analytics'), async (_req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const events = await AnalyticsEvent.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$eventName', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const activeSessions = await AnalyticsEvent.distinct('sessionId', { createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } });
  res.json({ activeVisitors: activeSessions.length, events });
});

marketingRouter.use(requireAuth);
marketingRouter.post('/scripts', requirePermission('manage_gtm'), async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().min(2),
      provider: z.enum(['gtm', 'ga4', 'meta_pixel', 'google_ads', 'clarity', 'hotjar', 'custom']),
      placement: z.enum(['head', 'body_start', 'body_end']),
      code: z.string().min(5),
      active: z.boolean().default(true)
    }).parse(req.body);
    res.status(201).json(await TrackingScript.create(body));
  } catch (error) { next(error); }
});

