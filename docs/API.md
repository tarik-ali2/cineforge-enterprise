# API Reference

Base URL: `http://localhost:4000`

## Auth
- `POST /api/auth/login` body: `{ "email": "...", "password": "..." }`
- `POST /api/auth/logout`

## Public
- `GET /api/public/landing`
- `GET /api/public/scripts/head`
- `GET /api/public/scripts/body`
- `GET /api/public/scripts/footer`

## CMS
Requires authentication.
- `GET /api/cms/pages`
- `POST /api/cms/pages`
- `GET /api/cms/cards`
- `POST /api/cms/cards`
- `PATCH /api/cms/cards/:id`
- `GET /api/cms/media`
- `POST /api/cms/media` multipart field `file`, plus optional `folder`, `alt`, `title`, `caption`, `description`, `tags`

Card fields include `adminName`, `cardType`, `title`, `description`, `videoUrl`, `recommendedWidth`, `recommendedHeight`, `targetSlot`, `imageFit` and `sortOrder`.

## Commerce
- `POST /api/create-order`
- `POST /api/verify-payment`
- `GET /api/order-status/:orderCode`
- `GET /api/commerce/offers`
- `POST /api/commerce/orders`
- `GET /api/commerce/orders`
- `PATCH /api/commerce/orders/:id/status`

`/api/create-order` creates a pending/payment_started order and returns `eventId`, `checkoutUrl`, `successRedirectUrl`, and `webhookUrl`.

`/api/verify-payment` must be called by the payment provider webhook or verified server process. In production, set `PAYMENT_WEBHOOK_SECRET` and send it as `x-webhook-secret`. Purchase tracking is sent only after this endpoint verifies `status=paid` and amount matches the saved order.

## Marketing
- `POST /api/marketing/track`
- `POST /api/marketing/leads`
- `GET /api/marketing/analytics/summary`
- `POST /api/marketing/scripts`

Recommended DataLayer events: `page_view`, `CTA_click`, `button_click`, `form_start`, `form_submit`, `add_to_cart`, `initiate_checkout`, `purchase`, `thank_you_page`, `whatsapp_click`, `phone_click`, `email_click`, `scroll_depth`, `video_play`, `lead_generated`, `section_view`.

Meta Pixel browser events:
- `PageView` on site load.
- `ViewContent` on landing page.
- `InitiateCheckout` on purchase CTA/payment start.
- `AddPaymentInfo` after server order creation.
- `Purchase` only on `/thank-you?paid=1` after `/api/order-status/:orderCode` returns verified.
