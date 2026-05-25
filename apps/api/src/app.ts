import express from 'express';
import path from 'node:path';
import { connectDb } from './db/mongoose.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { applySecurity } from './middleware/security.js';
import { adminRouter } from './routes/admin.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { cmsRouter } from './routes/cms.routes.js';
import { commerceRouter } from './routes/commerce.routes.js';
import { marketingRouter } from './routes/marketing.routes.js';
import { publicRouter } from './routes/public.routes.js';

export async function createApp(options: { serveStaticMedia?: boolean } = {}) {
  await connectDb();

  const app = express();
  applySecurity(app);

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'cineforge-api', time: new Date().toISOString() });
  });

  if (options.serveStaticMedia ?? true) {
    app.use('/media', express.static(path.join(process.cwd(), 'storage', 'public', 'media'), {
      immutable: true,
      maxAge: '30d'
    }));
  }

  app.use('/api/public', publicRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/cms', cmsRouter);
  app.use('/api/commerce', commerceRouter);
  app.use('/api', commerceRouter);
  app.use('/api/marketing', marketingRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
