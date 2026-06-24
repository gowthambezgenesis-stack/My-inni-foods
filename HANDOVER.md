# Project Handover Document — inni Products

**From:** Development team  
**To:** Deployment / infrastructure team  
**Purpose:** Hand over the current build so deployment can configure production hosting, APIs, secrets, and go-live.

---

## 1. Project overview

**inni Products** is a full-stack e-commerce application for premium spice products.

| Layer | Stack | Location |
|--------|--------|----------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind, Framer Motion | `inni-products/` |
| **Backend** | Django 6, Django REST Framework, PostgreSQL | `backend/` |
| **Payments** | Razorpay (checkout + verify + webhook) | `backend/payment/` |
| **Auth (admin)** | Email OTP + JWT (refresh in HttpOnly cookie) | `backend/accounts/` |

**Note on external APIs:** This repository does **not** include a Meta/Facebook API integration. The deployment team is responsible for production URLs, environment variables, Razorpay webhooks, SMTP, database hosting, and HTTPS. If Meta/catalog or other third-party integrations are planned, they are **out of scope** for this handover unless added in a future phase.

---

## 2. What is built and working (dev-tested)

### Customer-facing (storefront)

| Feature | Status | Notes |
|---------|--------|--------|
| Shop, cart, checkout | ✅ Working | Guest checkout supported |
| Razorpay payment | ✅ Working | Create order → modal → verify signature |
| Payment success page | ✅ Working | Live tracking preview after payment |
| **Track order** (`/track-order`) | ✅ Working | Order # + email or mobile |
| Animated tracking timeline | ✅ Working | 6 stages, green progress animation |
| **Invoice PDF download** | ✅ Working | `POST /api/orders/track/invoice/` — ReportLab, includes Order ID |
| Real-time order polling | ✅ Working | Refreshes every ~5s on track page |

### Admin panel (`/admin`)

| Feature | Status | Notes |
|---------|--------|--------|
| OTP login (email) | ✅ Working | Requires SMTP configured |
| Role-based access | ✅ Working | super_admin, order_manager, support_agent, viewer |
| Orders list + filters | ✅ Working | Search, status, payment filters |
| Order detail + status update | ✅ Working | Only: processing → shipping → out_for_delivery → delivered |
| Dashboard stats | ✅ Working | Revenue visible to super_admin / order_manager |
| Create admin | ✅ Working | Super Admin only |
| Remove admin | ✅ Working | Super Admin only |
| **New order email alerts** | ✅ Implemented | Emails super_admin + order_manager when order is paid |

### Backend APIs (main routes)

```
/api/orders/create/          — Checkout (creates order + Razorpay order)
/api/orders/track/           — Guest order lookup
/api/orders/track/invoice/   — PDF invoice (verified guest)
/api/payment/verify-payment/ — Post-payment signature verify
/api/payment/webhook/        — Razorpay server webhook (backup)
/api/admin/auth/send-otp/    — Admin OTP
/api/admin/auth/verify-otp/  — Admin login
/api/admin/users/            — Admin user management
/api/admin/dashboard/stats/  — Dashboard
```

### PDF invoice — confirmed working

- **Endpoint:** `POST /api/orders/track/invoice/`
- **Library:** `reportlab==4.4.1`
- **Includes:** Order ID, customer name, email, shipping address, items, total, status
- **Requirement:** Same verification as track order (order number + email **or** mobile)
- **Tested:** PDF generation verified in dev (valid `%PDF` output)

---

## 3. What the deployment team must configure

### Environment variables

**Backend** (`backend/.env` — use `backend/.env.example` as template):

| Variable | Required | Purpose |
|----------|----------|---------|
| `SECRET_KEY` | Yes | Django secret |
| `DEBUG` | Yes | `False` in production |
| `ALLOWED_HOSTS` | Yes | Production domain(s) |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Yes | PostgreSQL |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Yes | Live or test keys |
| `RAZORPAY_WEBHOOK_SECRET` | Yes (prod) | Webhook signature verification |
| `CORS_ALLOWED_ORIGINS` | Yes | Frontend URL(s) |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS` | Yes | SMTP |
| `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | Yes | Admin OTP + order notifications |
| `DEFAULT_FROM_EMAIL` | Yes | Sender address |
| `FRONTEND_BASE_URL` | Yes | Links in notification emails (e.g. `https://yourdomain.com`) |
| `ORDER_NOTIFICATIONS_ENABLED` | Optional | Default `True` |
| `JWT_COOKIE_SECURE` | Yes (prod) | Set `True` over HTTPS |

**Frontend** (`inni-products/.env` — use `inni-products/.env.example` as template):

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_BASE_URL` | Yes | e.g. `https://api.yourdomain.com/api` |

### Infrastructure tasks

1. **PostgreSQL** — Create database and run migrations:
   ```bash
   cd backend
   python manage.py migrate
   ```
2. **Super Admin** — Create initial admin user:
   ```bash
   python manage.py create_superadmin --email admin@example.com --full-name "Admin Name"
   ```
3. **HTTPS** — Required for Razorpay live mode and secure JWT cookies
4. **Razorpay webhook** — Register public URL in Razorpay dashboard:
   ```
   https://<api-domain>/api/payment/webhook/
   ```
   Subscribe to: `payment.captured`, `payment.failed`
5. **SMTP** — Production mail provider (Gmail App Password, SendGrid, AWS SES, etc.)
6. **Frontend build** — Build and serve static files:
   ```bash
   cd inni-products
   yarn install
   yarn build
   ```
   Serve the `dist/` folder via CDN, Nginx, or static host
7. **CORS** — Backend must allow the production frontend origin
8. **Secrets** — Never commit `.env` files; use deployment secrets manager

### Optional but recommended

- **Celery + Redis** — Order notification emails currently use background threads; Celery task hook exists in `notifications/tasks.py`
- **Scheduled job** — Run OTP cleanup periodically:
  ```bash
  python manage.py prune_admin_login_otps
  ```
  Deletes admin login OTP records older than 2 days
- **Reverse proxy** — Nginx or Caddy in front of API and frontend

---

## 4. Pre-handover checklist (development team)

Complete these before formal handover:

### Code and repository

- [ ] Push latest code to Git (main/develop branch)
- [ ] Confirm `.env` is in `.gitignore` (no secrets in repo)
- [ ] Share `.env.example` files with deployment team
- [ ] Document any uncommitted local changes

### Documentation to provide

- [ ] List of admin users and their roles (super_admin, order_manager)
- [ ] Razorpay account details (test vs live keys)
- [ ] SMTP account used for OTP and notifications
- [ ] Sample test order number for smoke testing track + PDF

### Functional smoke tests

- [ ] Place test order → complete Razorpay test payment → success page loads
- [ ] Track order with email/mobile → timeline loads and updates
- [ ] Download invoice PDF → opens correctly with Order ID
- [ ] Admin OTP login works
- [ ] Admin updates order status → track page reflects change
- [ ] New paid order triggers notification email to admins (if SMTP enabled)
- [ ] `python manage.py check` passes
- [ ] Frontend `yarn tsc --noEmit` passes

### Known limitations to disclose

| Item | Detail |
|------|--------|
| **Product catalog** | Frontend uses **static product data** (`inni-products/src/data/`) — not fully wired to a backend products API |
| **Razorpay webhook** | Implemented but requires public URL + webhook secret in production |
| **Celery** | Not configured; notification emails use background threads |
| **Django admin** | Built-in Django `/admin/` exists; primary UI is custom React admin at `/admin` |
| **No Meta API** | No Facebook/Meta catalog or ads integration in this codebase |

---

## 5. How to run locally

### Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env    # fill in values
python manage.py migrate
python manage.py runserver    # http://localhost:8000
```

### Frontend

```bash
cd inni-products
yarn install
cp .env.example .env
yarn dev    # http://localhost:3000
```

### Useful management commands

```bash
# Create Super Admin
python manage.py create_superadmin --email you@example.com --full-name "Your Name"

# Test new-order notification email
python manage.py send_test_order_notification
python manage.py send_test_order_notification --order-number IN-XXXXXXXX

# Clean old admin OTP records (2+ days)
python manage.py prune_admin_login_otps
```

---

## 6. Order fulfillment flow

Customer-visible tracking stages (in order):

1. Order Received  
2. Payment Confirmed  
3. Processing  
4. Shipping  
5. Out For Delivery  
6. Delivered  

Admin status dropdown only allows: **processing**, **shipping**, **out_for_delivery**, **delivered**.

---

## 7. Admin roles

| Role | Access |
|------|--------|
| `super_admin` | Full access: dashboard, orders, users, settings, revenue |
| `order_manager` | Dashboard, orders (can update status), revenue |
| `support_agent` | Dashboard, orders (view only) |
| `viewer` | Dashboard, orders (view only) |

Admin login uses **email OTP** (no password). OTP expires in 5 minutes.

---

## 8. Payment flow (technical)

1. Frontend calls `POST /api/orders/create/` with cart + shipping + email  
2. Backend creates `Order`, `OrderItem`s, Razorpay order, and `Payment` record  
3. Razorpay checkout modal opens on frontend  
4. On success, frontend calls `POST /api/payment/verify-payment/` with signature  
5. Backend verifies signature → `Payment.status = success` → signal updates `Order` to **paid** / **processing**  
6. Optional: Razorpay webhook `POST /api/payment/webhook/` as backup if frontend verify fails  
7. On paid order: email notification sent to `super_admin` and `order_manager` users  

---

## 9. Suggested handover email (copy-paste)

> **Subject: inni Products — Dev handover to deployment**
>
> Hi team,
>
> We're handing over the **inni Products** e-commerce application (React frontend + Django API). Core flows are implemented and tested in development:
>
> - Guest checkout with Razorpay  
> - Order tracking with live status updates  
> - Invoice PDF download (ReportLab)  
> - Admin panel (OTP login, orders, users, status management)  
> - Email notifications to super_admin and order_manager on new paid orders  
>
> **Your responsibilities:** production hosting, PostgreSQL, env/secrets, HTTPS, CORS, Razorpay live keys + webhook URL, SMTP, and `VITE_API_BASE_URL` for the frontend build.
>
> **Repo structure:** `inni-products/` (frontend), `backend/` (API). See `.env.example` in each folder and `HANDOVER.md` at repo root.
>
> **Not in scope:** Meta/Facebook API, product CMS API (catalog is still static in frontend), Celery/Redis (optional).
>
> Please confirm once staging is up so we can run a joint smoke test (checkout → track → PDF → admin).
>
> Thanks,  
> Development team

---

## 10. Key file reference

| Area | Path |
|------|------|
| Django settings | `backend/config/settings.py` |
| Order models | `backend/orders/models.py` |
| Order signals (payment sync, email trigger) | `backend/orders/signals.py` |
| Invoice PDF builder | `backend/orders/invoice.py` |
| Payment / Razorpay | `backend/payment/views.py` |
| Admin OTP auth | `backend/accounts/views.py` |
| New order emails | `backend/notifications/utils.py` |
| Email HTML template | `backend/notifications/templates/notifications/emails/new_order.html` |
| Frontend API client | `inni-products/src/lib/api.ts` |
| Checkout | `inni-products/src/pages/Checkout.tsx` |
| Track order | `inni-products/src/pages/TrackOrder.tsx` |
| Admin panel | `inni-products/src/pages/admin/` |
| Backend env template | `backend/.env.example` |
| Frontend env template | `inni-products/.env.example` |
| **API docs (Swagger)** | `http://localhost:8000/api/docs/` (when `SWAGGER_ENABLED=True`) |
| **API docs (ReDoc)** | `http://localhost:8000/api/redoc/` |
| OpenAPI schema JSON | `http://localhost:8000/api/schema/` |

---

## 11. API documentation (Swagger / OpenAPI)

Interactive API docs are available via **drf-spectacular**:

| URL | Description |
|-----|-------------|
| `/api/docs/` | Swagger UI |
| `/api/redoc/` | ReDoc |
| `/api/schema/` | OpenAPI 3 schema (JSON) |

**Enable in production:** set `SWAGGER_ENABLED=True` in backend `.env` (defaults to `True` when `DEBUG=True`).

**Auth in Swagger:** click **Authorize** and enter `Bearer <access_token>` from admin OTP verify.

---

*Last updated: June 2026 — Development team handover to deployment.*
