# Security Notes

Implemented:
- Helmet secure headers.
- CORS allow-list via `WEB_URL`.
- Rate limits for API requests.
- Mongo sanitize and HPP protection.
- JWT access tokens and refresh-token session storage.
- RBAC permission middleware.
- Password hashing with bcrypt.
- Audit log model and suspicious-login-ready session model.

Production hardening checklist:
- Use secrets of at least 32 characters.
- Keep admin password out of Git and rotate after first login.
- Put the site behind Cloudflare with SSL, WAF and bot protection enabled.
- Restrict admin routes by IP if possible.
- Use SMTP with verified sender domain for PDF delivery emails.
- Store paid PDF files outside the public web root.
- Enable database backups in MongoDB Atlas.
- Add malware scanning for public uploads before enabling user-generated uploads.
