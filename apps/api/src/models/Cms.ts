import { Schema, model } from 'mongoose';

const seoSchema = new Schema({
  metaTitle: String,
  metaDescription: String,
  focusKeywords: [String],
  canonicalUrl: String,
  robots: { type: String, default: 'index,follow' },
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  schemaType: { type: String, enum: ['WebPage', 'Article', 'Product', 'FAQPage'], default: 'WebPage' },
  schemaJson: Schema.Types.Mixed
}, { _id: false });

const pageSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['homepage', 'landing', 'blog', 'product', 'legal', 'thank_you'], default: 'landing' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  sections: [Schema.Types.Mixed],
  seo: seoSchema,
  publishedAt: Date
}, { timestamps: true });

const cardSchema = new Schema({
  sectionKey: { type: String, required: true, index: true },
  cardType: { type: String, enum: ['image', 'video', 'course', 'testimonial', 'tool_logo'], required: true },
  adminName: { type: String, required: true },
  title: String,
  description: String,
  mediaId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
  videoUrl: String,
  imageFit: { type: String, enum: ['cover', 'contain', 'fill'], default: 'cover' },
  recommendedWidth: Number,
  recommendedHeight: Number,
  targetSlot: String,
  sortOrder: { type: Number, default: 0, index: true },
  active: { type: Boolean, default: true, index: true }
}, { timestamps: true });

const mediaSchema = new Schema({
  folder: { type: String, default: 'general', index: true },
  originalName: String,
  filename: { type: String, required: true },
  url: { type: String, required: true },
  mimeType: String,
  size: Number,
  width: Number,
  height: Number,
  alt: String,
  title: String,
  caption: String,
  description: String,
  tags: [String],
  optimized: { type: Boolean, default: false }
}, { timestamps: true });

export const CmsPage = model('CmsPage', pageSchema);
export const LandingCard = model('LandingCard', cardSchema);
export const MediaAsset = model('MediaAsset', mediaSchema);

