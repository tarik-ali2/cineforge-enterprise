# CineForge AI Enterprise

Production-oriented website, CMS/admin panel, analytics, SEO, tracking, lead/order management, and security architecture.

## Architecture

- `apps/web`: Next.js App Router, React, Tailwind CSS, TypeScript, Framer Motion.
- `apps/api`: Node.js, Express, MongoDB/Mongoose, JWT auth, RBAC, analytics, CMS APIs.
- `infra`: Docker, PM2, Nginx, Render, Cloudflare and deployment guidance.
- `docs`: API, security, SEO, analytics and admin operating docs.

## Default Admin

Seed creates:

- Email: value of `ADMIN_EMAIL`
- Password: value of `ADMIN_PASSWORD` (`Happy0808` if unchanged)

Change it immediately after first login.

## Quick Start

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

## Production

```bash
npm run build
npm run start
```

See `docs/DEPLOYMENT.md`.

