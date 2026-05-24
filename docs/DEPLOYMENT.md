# Deployment Guide

## Local Setup
1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`.
3. Run `npm install`.
4. Run `npm run seed` to create roles, homepage data and admin.
5. Run `npm run dev`.

Default seeded admin:
- Email: `admin@cineforge.ai`
- Password: `Happy0808`

Change this password immediately after first production login.

## Render + MongoDB Atlas
1. Create a MongoDB Atlas free cluster and copy the connection string.
2. Create two Render web services from this folder using `render.yaml`.
3. Add environment variables:
   - API service: `MONGODB_URI`, `APP_URL`, `API_URL`, `WEB_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`, `ADMIN_PASSWORD`
   - Web service: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WEB_URL`
4. Deploy API first, then run `npm run seed --workspace apps/api` from Render shell.
5. Deploy web and point your domain through Cloudflare.

## PM2 + Nginx
1. Build: `npm run build`
2. Start: `pm2 start infra/ecosystem.config.cjs`
3. Copy `infra/nginx.conf` to your Nginx sites folder.
4. Use Certbot or Cloudflare SSL for HTTPS.

## Docker
Run:
```bash
docker compose up --build
```

Then open:
- Web: `http://localhost:3000`
- API health: `http://localhost:4000/health`
