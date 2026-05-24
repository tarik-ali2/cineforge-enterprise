import { Router } from 'express';
import { CmsPage, LandingCard } from '../models/Cms.js';
import { CheckoutOffer } from '../models/Commerce.js';
import { TrackingScript } from '../models/Marketing.js';
import { Setting } from '../models/System.js';

export const publicRouter = Router();

publicRouter.get('/landing', async (_req, res) => {
  const [page, cards, offers, settings] = await Promise.all([
    CmsPage.findOne({ slug: 'home', status: 'published' }).lean(),
    LandingCard.find({ active: true }).populate('mediaId').sort({ sectionKey: 1, sortOrder: 1 }).lean(),
    CheckoutOffer.find({ active: true }).sort({ sortOrder: 1 }).lean(),
    Setting.find().lean()
  ]);
  res.json({ page, cards, offers, settings: Object.fromEntries(settings.map((s) => [s.key, s.value])) });
});

publicRouter.get('/scripts/:placement', async (req, res) => {
  const placement = req.params.placement;
  const scripts = await TrackingScript.find({ active: true, placement }).sort({ createdAt: 1 }).lean();
  res.type('text/javascript').send(scripts.map((s) => s.code).join('\n'));
});
