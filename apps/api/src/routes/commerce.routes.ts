import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { CheckoutOffer, Order } from '../models/Commerce.js';

export const commerceRouter = Router();

commerceRouter.get('/offers', async (_req, res) => {
  res.json(await CheckoutOffer.find({ active: true }).sort({ sortOrder: 1 }).lean());
});

commerceRouter.post('/orders', async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      items: z.array(z.any()).min(1),
      amount: z.number().min(1)
    }).parse(req.body);
    const order = await Order.create({ ...body, orderCode: 'CF-' + nanoid(10).toUpperCase() });
    res.status(201).json({ orderCode: order.orderCode, status: order.status });
  } catch (error) { next(error); }
});

commerceRouter.use(requireAuth);
commerceRouter.get('/orders', requirePermission('view_orders'), async (_req, res) => {
  res.json(await Order.find().sort({ createdAt: -1 }).limit(500).lean());
});

commerceRouter.patch('/orders/:id/status', requirePermission('manage_orders'), async (req, res) => {
  const status = z.enum(['pending', 'submitted', 'approved', 'rejected']).parse(req.body.status);
  res.json(await Order.findByIdAndUpdate(req.params.id, { status, approvedAt: status === 'approved' ? new Date() : undefined }, { new: true }));
});

