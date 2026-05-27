import { Router } from 'express';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { z } from 'zod';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { CmsPage, LandingCard, MediaAsset } from '../models/Cms.js';

export const cmsRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^(image|video)\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image and video uploads are allowed'));
  }
});
cmsRouter.use(requireAuth);

cmsRouter.get('/pages', requirePermission('manage_content'), async (_req, res) => {
  res.json(await CmsPage.find().sort({ updatedAt: -1 }).lean());
});

cmsRouter.post('/pages', requirePermission('manage_content'), async (req, res, next) => {
  try {
    const body = z.object({
      title: z.string().min(2),
      slug: z.string().min(1),
      type: z.string().default('landing'),
      status: z.enum(['draft', 'published']).default('draft'),
      sections: z.array(z.any()).default([]),
      seo: z.any().optional()
    }).parse(req.body);
    res.status(201).json(await CmsPage.create(body));
  } catch (error) { next(error); }
});

cmsRouter.get('/cards', requirePermission('manage_content'), async (_req, res) => {
  res.json(await LandingCard.find().populate('mediaId').sort({ sectionKey: 1, sortOrder: 1 }).lean());
});

cmsRouter.post('/cards', requirePermission('manage_content'), async (req, res, next) => {
  try {
    const body = z.object({
      sectionKey: z.string(),
      cardType: z.enum(['image', 'video', 'course', 'testimonial', 'tool_logo']),
      adminName: z.string().min(2),
      title: z.string().optional(),
      description: z.string().optional(),
      mediaId: z.string().optional(),
      videoUrl: z.string().url().optional().or(z.literal('')),
      imageFit: z.enum(['cover', 'contain', 'fill']).default('cover'),
      recommendedWidth: z.number().optional(),
      recommendedHeight: z.number().optional(),
      targetSlot: z.string().optional(),
      sortOrder: z.number().default(0),
      active: z.boolean().default(true)
    }).parse(req.body);
    res.status(201).json(await LandingCard.create(body));
  } catch (error) { next(error); }
});

cmsRouter.patch('/cards/:id', requirePermission('manage_content'), async (req, res) => {
  res.json(await LandingCard.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
});

cmsRouter.get('/media', requirePermission('manage_media'), async (_req, res) => {
  res.json(await MediaAsset.find().sort({ createdAt: -1 }).lean());
});

cmsRouter.post('/media/link', requirePermission('manage_media'), async (req, res, next) => {
  try {
    const body = z.object({
      folder: z.string().default('external'),
      url: z.string().url(),
      title: z.string().min(2),
      alt: z.string().optional(),
      caption: z.string().optional(),
      description: z.string().optional(),
      width: z.coerce.number().optional(),
      height: z.coerce.number().optional(),
      tags: z.string().optional()
    }).parse(req.body);

    const asset = await MediaAsset.create({
      folder: body.folder,
      originalName: body.title,
      filename: body.url.split('/').pop() || body.title,
      url: body.url,
      mimeType: 'external/image',
      width: body.width,
      height: body.height,
      alt: body.alt,
      title: body.title,
      caption: body.caption,
      description: body.description,
      tags: body.tags ? body.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      optimized: false
    });

    res.status(201).json(asset);
  } catch (error) { next(error); }
});

cmsRouter.post('/media', requirePermission('manage_media'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new Error('File is required');
    const body = z.object({
      folder: z.string().default('general'),
      alt: z.string().optional(),
      title: z.string().optional(),
      caption: z.string().optional(),
      description: z.string().optional(),
      tags: z.string().optional()
    }).parse(req.body);

    const isImage = req.file.mimetype.startsWith('image/');
    const mediaDir = path.join(process.cwd(), 'storage', 'public', 'media', body.folder);
    await mkdir(mediaDir, { recursive: true });

    let buffer = req.file.buffer;
    let width: number | undefined;
    let height: number | undefined;
    let ext = path.extname(req.file.originalname).toLowerCase().replace('.', '') || 'bin';

    if (isImage) {
      const image = sharp(req.file.buffer).rotate();
      const metadata = await image.metadata();
      width = metadata.width;
      height = metadata.height;
      buffer = await image.webp({ quality: 82 }).toBuffer();
      ext = 'webp';
    }

    const filename = `${nanoid(12)}.${ext}`;
    await writeFile(path.join(mediaDir, filename), buffer);

    const asset = await MediaAsset.create({
      folder: body.folder,
      originalName: req.file.originalname,
      filename,
      url: `/media/${body.folder}/${filename}`,
      mimeType: isImage ? 'image/webp' : req.file.mimetype,
      size: buffer.byteLength,
      width,
      height,
      alt: body.alt,
      title: body.title,
      caption: body.caption,
      description: body.description,
      tags: body.tags ? body.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      optimized: isImage
    });

    res.status(201).json(asset);
  } catch (error) { next(error); }
});
