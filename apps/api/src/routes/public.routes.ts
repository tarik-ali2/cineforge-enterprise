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
    res.setHeader('Content-Type', asset.mimeType || 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(asset.data);
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
