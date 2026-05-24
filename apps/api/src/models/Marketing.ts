import { Schema, model } from 'mongoose';

const trackingScriptSchema = new Schema({
  name: { type: String, required: true },
  provider: { type: String, enum: ['gtm', 'ga4', 'meta_pixel', 'google_ads', 'clarity', 'hotjar', 'custom'], default: 'custom' },
  placement: { type: String, enum: ['head', 'body_start', 'body_end'], default: 'head' },
  code: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const eventSchema = new Schema({
  sessionId: { type: String, required: true, index: true },
  eventName: { type: String, required: true, index: true },
  pageUrl: String,
  referrer: String,
  metadata: Schema.Types.Mixed,
  ipHash: String,
  userAgent: String,
  country: String,
  device: String,
  browser: String
}, { timestamps: true });
eventSchema.index({ eventName: 1, createdAt: -1 });

const leadSchema = new Schema({
  name: String,
  email: { type: String, index: true },
  phone: String,
  source: String,
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'won', 'lost'], default: 'new', index: true },
  utm: Schema.Types.Mixed,
  notes: String
}, { timestamps: true });

export const TrackingScript = model('TrackingScript', trackingScriptSchema);
export const AnalyticsEvent = model('AnalyticsEvent', eventSchema);
export const Lead = model('Lead', leadSchema);

