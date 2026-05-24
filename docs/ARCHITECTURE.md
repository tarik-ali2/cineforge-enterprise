# CineForge Enterprise Architecture

## Stack
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion, SSR metadata.
- Backend: Node.js, Express, TypeScript, REST APIs, controller/route/service/model separation.
- Database: MongoDB with Mongoose models and indexed CMS, user, commerce, lead and analytics collections.
- Infrastructure: Docker, PM2, Nginx reverse proxy, Render config, Cloudflare-compatible headers.

## Core Modules
- Landing CMS: editable pages, hero sections, cards, media slots, testimonials and pricing.
- Commerce: checkout offers, order capture, payment status, secure PDF delivery flow.
- Admin: login, RBAC roles, custom permissions, settings, tracking scripts, analytics summaries.
- Marketing: GTM/GA4/Meta/remarketing custom scripts, DataLayer events and UTM/session tracking.
- SEO: per-page metadata, canonical, robots, schema type, future sitemap/robots generation.
- Security: JWT access tokens, refresh token sessions, rate limits, helmet, CORS, upload validation-ready media model, audit log model.

## Free Deployment Path
- MongoDB Atlas free tier for database.
- Render free tier for API and web services, or one VPS/shared Node host if available.
- Cloudflare free tier for DNS, CDN, SSL and basic DDoS protection.
