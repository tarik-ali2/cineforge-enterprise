import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { env, isProduction } from '../config/env.js';

export function applySecurity(app: Express) {
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  app.use(cors({
    origin: [env.WEB_URL, env.APP_URL],
    credentials: true
  }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(express.json({ limit: '1mb', type: ['application/json', 'text/plain'] }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(compression());
  app.use(hpp());
  app.use(mongoSanitize());
  app.use(morgan(isProduction ? 'combined' : 'dev'));
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }));
  app.use('/api/marketing/track', rateLimit({ windowMs: 60 * 1000, limit: 240 }));
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 600 }));
}
