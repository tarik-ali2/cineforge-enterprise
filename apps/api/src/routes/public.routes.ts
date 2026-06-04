import { Router } from 'express';
import { connectDb } from '../db/mongoose.js';
import { CmsPage, LandingCard, MediaAsset } from '../models/Cms.js';
import { CheckoutOffer } from '../models/Commerce.js';
import { TrackingScript } from '../models/Marketing.js';
import { Setting } from '../models/System.js';

export const publicRouter = Router();

function connectWithTimeout(ms = 6000) {
  return Promise.race([
    connectDb(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout')), ms))
  ]);
}

function toMediaBuffer(data: unknown) {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Uint8Array) return Buffer.from(data);
  if (data && typeof data === 'object') {
    const value = data as { buffer?: Uint8Array | ArrayBuffer; data?: number[] };
    if (value.buffer) return value.buffer instanceof Uint8Array ? Buffer.from(value.buffer) : Buffer.from(new Uint8Array(value.buffer));
    if (Array.isArray(value.data)) return Buffer.from(value.data);
  }
  return Buffer.from(data as ArrayBuffer);
}

publicRouter.get('/landing', async (_req, res) => {
  try {
    await connectWithTimeout();
    const [page, cards, offers, settings] = await Promise.all([
      CmsPage.findOne({ slug: 'home', status: 'published' }).lean(),
      LandingCard.find({ active: true }).populate('mediaId').sort({ sectionKey: 1, sortOrder: 1 }).lean(),
      CheckoutOffer.find({ active: true }).sort({ sortOrder: 1 }).lean(),
      Setting.find().lean()
    ]);
    res.json({ page, cards, offers, settings: Object.fromEntries(settings.map((s) => [s.key, s.value])) });
  } catch (error) {
    res.json({ page: null, cards: [], offers: [], settings: {}, degraded: true });
  }
});

publicRouter.get('/media/:id', async (req, res) => {
  try {
    await connectWithTimeout();
    const asset = await MediaAsset.findById(req.params.id).select('+data').lean();
    if (!asset?.data) return res.status(404).send('Media not found');
    const imageData = toMediaBuffer(asset.data);
    res.setHeader('Content-Type', asset.mimeType || 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Length', imageData.byteLength.toString());
    res.send(imageData);
  } catch {
    res.status(404).send('Media not found');
  }
});

publicRouter.get('/scripts/:placement', async (req, res) => {
  try {
    await connectWithTimeout();
    const placement = req.params.placement;
    const scripts = await TrackingScript.find({ active: true, placement }).sort({ createdAt: 1 }).lean();
    res.type('text/javascript').send(scripts.map((s) => s.code).join('\n'));
  } catch {
    res.type('text/javascript').send('');
  }
});
