import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { env, isProduction } from '../config/env.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { CheckoutOffer, Order } from '../models/Commerce.js';
import { Setting } from '../models/System.js';
import { sendMetaPurchaseEvent } from '../services/meta.service.js';

export const commerceRouter = Router();
const currency = 'INR';

async function getCheckoutSettings(amount: number) {
  const settings = await Setting.find({
    key: {
      $in: [
        'provider',
        'external_checkout_url',
        'success_redirect_url',
        'checkout_url_199',
        'checkout_url_348',
        'checkout_url_495'
      ]
    }
  }).lean();
  const map = Object.fromEntries(settings.map((setting) => [setting.key, String(setting.value ?? '')]));
  const amountLink = map[`checkout_url_${amount}`];
  return {
    provider: map.provider || env.PAYMENT_PROVIDER,
    checkoutUrl: amountLink || map.external_checkout_url || env.EXTERNAL_CHECKOUT_URL,
    successRedirectUrl: map.success_redirect_url || env.PAYMENT_SUCCESS_REDIRECT_URL || `${env.WEB_URL}/thank-you`
  };
}

function appendQuery(url: string, params: Record<string, string>) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${new URLSearchParams(params).toString()}`;
}

commerceRouter.get('/offers', async (_req, res) => {
  res.json(await CheckoutOffer.find({ active: true }).sort({ sortOrder: 1 }).lean());
});

async function createOrder(req: any, res: any, next: any) {
  try {
    const body = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      items: z.array(z.any()).min(1),
      amount: z.number().min(1),
      utm: z.any().optional()
    }).parse(req.body);
    const computedAmount = body.items.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0);
    if (computedAmount !== body.amount) return res.status(422).json({ error: 'Amount mismatch' });

    const orderCode = 'CF-' + nanoid(10).toUpperCase();
    const eventId = `purchase_${orderCode}_${nanoid(8)}`;
    const paymentSettings = await getCheckoutSettings(body.amount);
    const successRedirectUrl = paymentSettings.successRedirectUrl.startsWith('http')
      ? paymentSettings.successRedirectUrl
      : `${env.WEB_URL}${paymentSettings.successRedirectUrl.startsWith('/') ? '' : '/'}${paymentSettings.successRedirectUrl}`;
    const successUrlWithParams = appendQuery(successRedirectUrl, { order: orderCode, event_id: eventId });
    const checkoutUrl = paymentSettings.checkoutUrl
      ? appendQuery(paymentSettings.checkoutUrl, { order_id: orderCode, amount: String(body.amount), success_url: successUrlWithParams })
      : '';

    const order = await Order.create({
      ...body,
      orderCode,
      eventId,
      currency,
      paymentMethod: paymentSettings.provider === 'manual_upi' ? 'upi_manual' : 'external',
      paymentProvider: paymentSettings.provider,
      status: checkoutUrl ? 'payment_started' : 'pending',
      successRedirectUrl,
      checkoutUrl
    });

    res.status(201).json({
      orderCode: order.orderCode,
      eventId,
      amount: order.amount,
      currency,
      status: order.status,
      payment: {
        provider: paymentSettings.provider,
        checkoutUrl,
        successRedirectUrl: successUrlWithParams,
        webhookUrl: `${env.API_URL}/api/verify-payment`
      }
    });
  } catch (error) { next(error); }
}

commerceRouter.post('/orders', createOrder);
commerceRouter.post('/create-order', createOrder);

commerceRouter.get('/order-status/:orderCode', async (req, res) => {
  const order = await Order.findOne({ orderCode: req.params.orderCode }).lean();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({
    orderCode: order.orderCode,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    eventId: order.eventId,
    verified: order.status === 'paid' || order.status === 'approved'
  });
});

commerceRouter.post('/verify-payment', async (req, res, next) => {
  try {
    if (isProduction && env.PAYMENT_WEBHOOK_SECRET && req.headers['x-webhook-secret'] !== env.PAYMENT_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }
    const body = z.object({
      orderCode: z.string().min(3),
      transactionId: z.string().min(3),
      amount: z.number().min(1),
      status: z.enum(['paid', 'failed']),
      customerEmail: z.string().email().optional(),
      customerPhone: z.string().optional()
    }).parse(req.body);

    const order = await Order.findOne({ orderCode: body.orderCode });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.amount !== body.amount) return res.status(422).json({ error: 'Amount mismatch' });

    order.transactionId = body.transactionId;
    order.status = body.status;
    if (body.status === 'paid') {
      order.verifiedAt = new Date();
      order.approvedAt = new Date();
      if (!order.metaPurchaseSentAt) {
        try {
          const meta = await sendMetaPurchaseEvent({
            eventId: order.eventId ?? `purchase_${order.orderCode}`,
            amount: order.amount,
            currency: order.currency ?? currency,
            email: body.customerEmail ?? order.email,
          phone: body.customerPhone ?? order.phone ?? undefined,
            pageUrl: `${env.WEB_URL}/thank-you?paid=1&order=${order.orderCode}`,
            clientIp: req.ip,
            userAgent: req.headers['user-agent']
          });
          if (meta.sent) order.metaPurchaseSentAt = new Date();
        } catch (error) {
          console.error('Meta CAPI Purchase failed', error);
        }
      }
    }
    await order.save();
    res.json({ ok: true, orderCode: order.orderCode, status: order.status, eventId: order.eventId });
  } catch (error) { next(error); }
});

commerceRouter.use(requireAuth);
commerceRouter.get('/orders', requirePermission('view_orders'), async (_req, res) => {
  res.json(await Order.find().sort({ createdAt: -1 }).limit(500).lean());
});

commerceRouter.post('/offers', requirePermission('manage_orders'), async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().min(2),
      headline: z.string().min(2),
      description: z.string().optional(),
      price: z.number().min(0),
      defaultChecked: z.boolean().default(true),
      sortOrder: z.number().default(0),
      active: z.boolean().default(true)
    }).parse(req.body);
    res.status(201).json(await CheckoutOffer.create(body));
  } catch (error) { next(error); }
});

commerceRouter.patch('/offers/:id', requirePermission('manage_orders'), async (req, res) => {
  res.json(await CheckoutOffer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
});

commerceRouter.patch('/orders/:id/status', requirePermission('manage_orders'), async (req, res) => {
  const status = z.enum(['pending', 'payment_started', 'submitted', 'approved', 'rejected', 'paid', 'failed']).parse(req.body.status);
  res.json(await Order.findByIdAndUpdate(req.params.id, { status, approvedAt: status === 'approved' ? new Date() : undefined }, { new: true }));
});
