# Production Rollout — [bolsadecafe.com](https://www.bolsadecafe.com/)

Step-by-step guide to take Bolsa de Café live at **https://www.bolsadecafe.com/** on Vercel with HostGator MySQL, Stripe live mode, and Resend email.

---

## Architecture

| Layer | Provider | Notes |
|-------|----------|-------|
| Frontend + API | **Vercel** | SPA from `dist/`, API at `/api/*` via `api/index.ts` |
| Database | **HostGator MySQL** | Remote connection from Vercel serverless |
| Payments | **Stripe** (live mode) | Checkout, subscriptions, webhooks |
| Email | **Resend** | OTP codes, order/shipping notifications |
| Domain | **www.bolsadecafe.com** | Custom domain on Vercel |

---

## Pre-launch checklist

Use this as a go/no-go list before accepting real payments.

- [ ] All DB migrations applied on production MySQL
- [ ] `stripe_price_id_prod` filled for 250gr, 500gr, 1kg plans
- [ ] Vercel **Production** env vars set (see below)
- [ ] Stripe **live** webhook → `https://www.bolsadecafe.com/api/webhook`
- [ ] DNS: `www.bolsadecafe.com` → Vercel
- [ ] `FRONTEND_URL=https://www.bolsadecafe.com`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` (rebuild after setting)
- [ ] `JWT_SECRET` is a strong random value (app throws on startup if missing in production)
- [ ] Default admin password changed
- [ ] Smoke tests pass (ping, checkout, webhook, email links)

---

## Phase 1 — Database (HostGator MySQL)

### 1.1 Apply migrations

Connect to your production database and run every file in `database/migrations/` in chronological order. At minimum, confirm these exist:

| Migration | Purpose |
|-----------|---------|
| `002_add_stripe_price_ids.sql` | `stripe_price_id_test` / `stripe_price_id_prod` columns |
| `20260319_000000_add_stripe_invoice_id_to_orders.sql` | Webhook idempotency |
| `20260319_130000_add_admin_otp.sql` | Admin OTP login |
| `20260518_000000_remove_plan_features.sql` | Cleanup deprecated features |

```bash
mysql -h mx50.hostgator.mx -u YOUR_USER -p YOUR_DB < database/migrations/FILENAME.sql
```

### 1.2 Set live Stripe price IDs

1. In [Stripe Dashboard → Products (live mode)](https://dashboard.stripe.com/products), create three recurring monthly prices in MXN:
   - Bolsa de Café 250gr — $199
   - Bolsa de Café 500gr — $299
   - Bolsa de Café 1kg — $399

2. Update the production database:

```sql
UPDATE subscription_plans SET stripe_price_id_prod = 'price_LIVE_250gr' WHERE plan_id = '250gr';
UPDATE subscription_plans SET stripe_price_id_prod = 'price_LIVE_500gr' WHERE plan_id = '500gr';
UPDATE subscription_plans SET stripe_price_id_prod = 'price_LIVE_1kg'   WHERE plan_id = '1kg';
```

3. Verify:

```sql
SELECT plan_id, stripe_price_id_test, stripe_price_id_prod
FROM subscription_plans
WHERE plan_id IN ('250gr', '500gr', '1kg');
```

> Price IDs are read from the DB, not from env vars. Live vs test mode is determined by `STRIPE_SECRET_KEY` (`sk_live_` → prod column, `sk_test_` → test column).

### 1.3 Security

- Change the default admin password immediately after first login
- Ensure HostGator allows remote MySQL connections from Vercel IPs (or `%` for serverless)

---

## Phase 2 — Vercel deployment

### 2.1 Connect repository

1. Import the GitHub repo in [Vercel](https://vercel.com)
2. Framework preset: **Vite**
3. Build command: `npm run build` (from `vercel.json`)
4. Output directory: `dist`

### 2.2 Custom domain

1. Vercel project → **Settings → Domains**
2. Add `www.bolsadecafe.com` (primary)
3. Add `bolsadecafe.com` and redirect to `www` (recommended for SEO consistency)
4. Configure DNS at your registrar per Vercel instructions (CNAME or A records)

### 2.3 Production environment variables

Set these under **Settings → Environment Variables → Production**:

| Variable | Value | Build / Runtime |
|----------|-------|-----------------|
| `FRONTEND_URL` | `https://www.bolsadecafe.com` | Runtime |
| `JWT_SECRET` | Strong random string (32+ chars) | Runtime |
| `DB_HOST` | HostGator MySQL host | Runtime |
| `DB_PORT` | `3306` | Runtime |
| `DB_USER` | DB username | Runtime |
| `DB_PASSWORD` | DB password | Runtime |
| `DB_NAME` | Database name | Runtime |
| `DB_SSL` | `false` (or `true` if required) | Runtime |
| `STRIPE_SECRET_KEY` | `sk_live_...` (secret key — **not** `pk_` or `mk_`) | Runtime |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (live webhook) | Runtime |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (publishable key — **not** `sk_`) | **Build** — triggers client rebuild |
| `RESEND_API_KEY` | `re_...` | Runtime |
| `SMTP_FROM` | `Bolsa de Café <dihola@bolsadecafe.com>` | Runtime |

> **Important:** `VITE_*` variables are baked into the client bundle at build time. After changing them, redeploy.
>
> **Do not set `NODE_ENV=production` in Vercel env vars.** Vercel sets it automatically at runtime. If you add it manually, `npm install` skips devDependencies (including Vite) and the build fails with exit code 127. `vercel.json` uses `npm install --include=dev` as a safeguard. The build script sets `NODE_ENV=production` only during `vite build` so dev-only UI is stripped from the client bundle.

Copy `.env.example` as a local reference — never commit real secrets.

### 2.4 Deploy

```bash
# From project root, linked to Vercel project
vercel --prod
```

Or push to the production branch if Git integration is enabled.

---

## Phase 3 — Stripe (live mode)

### 3.1 Activate live mode

In Stripe Dashboard, toggle from **Test mode** to **Live mode** (top-right).

### 3.2 Webhook endpoint

See [stripe-webhook-setup.md](./stripe-webhook-setup.md) for full details.

**Production URL:**

```
https://www.bolsadecafe.com/api/webhook
```

**Events to enable:**

- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the **signing secret** → `STRIPE_WEBHOOK_SECRET` in Vercel Production → redeploy.

### 3.3 Key consistency

| Server | Client (build) |
|--------|----------------|
| `STRIPE_SECRET_KEY=sk_live_...` | `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` |

Mixing test and live keys will cause checkout failures.

---

## Phase 4 — Email (Resend)

1. Verify sending domain `bolsadecafe.com` in [Resend](https://resend.com/domains)
2. Add DNS records (SPF, DKIM) at your registrar
3. Set `RESEND_API_KEY` and `SMTP_FROM` in Vercel
4. Test: trigger a user OTP login — email links should point to `https://www.bolsadecafe.com`, not localhost

---

## Phase 5 — Smoke tests

Run these after deploy before announcing go-live.

### 5.1 Health check

```bash
curl https://www.bolsadecafe.com/api/ping
# Expected: {"message":"pong"} (or your PING_MESSAGE value)
```

### 5.2 Plans API

```bash
curl https://www.bolsadecafe.com/api/plans
# Expected: JSON with 250gr, 500gr, 1kg plans
```

### 5.3 Stripe webhook

In Stripe Dashboard → your live webhook → **Send test webhook** → `invoice.payment_succeeded`

Expected: **200 OK**, body `{"received":true}`

### 5.4 End-to-end subscription (live)

1. Open https://www.bolsadecafe.com/subscription-wizard
2. Complete checkout with a real card (or Stripe live test card if available in your region)
3. Confirm:
   - Subscription row in DB
   - Confirmation email received with correct links
   - Stripe Dashboard shows active subscription

### 5.5 Billing portal

From user dashboard → manage subscription → should return to `https://www.bolsadecafe.com/` after Stripe portal.

### 5.6 SEO

- View page source: canonical URLs should use `https://www.bolsadecafe.com`
- `https://www.bolsadecafe.com/robots.txt` allows crawlers

---

## Phase 6 — Post-launch monitoring

| What to watch | Where |
|---------------|-------|
| Webhook delivery failures | Stripe Dashboard → Webhooks |
| API errors | Vercel → Logs / Functions |
| Failed payments | Stripe → Subscriptions + `past_due` in DB |
| Email bounces | Resend Dashboard |
| DB connection issues | Vercel function logs (`DB_*` errors) |

---

## Rollback plan

If something breaks after go-live:

1. **Payments broken:** Switch Vercel `STRIPE_SECRET_KEY` back to `sk_test_...` and redeploy (stops live charges; existing live subs remain in Stripe)
2. **Site broken:** Vercel → Deployments → promote previous working deployment
3. **Webhook issues:** Check `STRIPE_WEBHOOK_SECRET` matches the live endpoint secret exactly

---

## Environment reference (local vs production)

| Variable | Local dev | Production |
|----------|-----------|------------|
| `NODE_ENV` | `development` | `production` (Vercel sets automatically) |
| `FRONTEND_URL` | `http://localhost:8080` | `https://www.bolsadecafe.com` |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` CLI | From Stripe live webhook |
| `JWT_SECRET` | Any dev value | Required — app fails without it |

---

## Related docs

- [stripe-webhook-setup.md](./stripe-webhook-setup.md) — Stripe CLI (local) and live webhook setup
- [database/README.md](../database/README.md) — Schema overview
- [README.md](../README.md) — Development setup

---

## Known gaps (manual steps)

These cannot be automated from the repo:

1. **Live Stripe price IDs** — must be created in Stripe Dashboard and inserted in MySQL
2. **Resend domain verification** — DNS at registrar
3. **HostGator remote MySQL** — whitelist Vercel/serverless IPs if connections fail
4. **Admin password** — change after first login
