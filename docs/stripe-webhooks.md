# Stripe Webhooks — Development & Production Setup

This guide explains how to configure Stripe webhooks for **Bolsa de Café** subscription billing. The handler lives in [`api/index.ts`](../api/index.ts) at `POST /api/webhook`.

---

## What the webhook does

| Stripe event | App behavior |
|--------------|--------------|
| `invoice.payment_succeeded` | Creates order + payment rows, sets subscription `active`, syncs billing period, emails admins (new order) |
| `invoice.payment_failed` | Sets subscription `past_due`, logs failed payment, emails **client + admins** (card declined) |
| `customer.subscription.updated` | Syncs status, period dates, and `cancel_at_period_end` |
| `customer.subscription.deleted` | Marks subscription `cancelled` in the database |

The initial subscription checkout also creates the first order in the API (`POST /api/payments/subscription`) to avoid race conditions. The webhook is **idempotent** — if the same invoice is processed twice, the second run is skipped via `stripe_invoice_id`.

---

## Required environment variables

Set these in `.env` (local) and in **Vercel → Project → Settings → Environment Variables**.

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` (dev) or `sk_live_...` (prod) — must match webhook mode |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from the webhook endpoint (one secret per endpoint) |
| `STRIPE_PUBLISHABLE_KEY` | Frontend key (`pk_test_...` / `pk_live_...`) |
| `FRONTEND_URL` | Public site URL (used in emails) |
| `RESEND_API_KEY` | Required for admin / decline notification emails |

**Important:** Test and Live modes use **different** API keys and **different** webhook endpoints/secrets. Never mix `sk_test_` with a Live webhook secret (or vice versa).

---

## Local development (Stripe Test mode)

### 1. Install Stripe CLI

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

Docs: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

### 2. Run the app

```bash
npm install
npm run dev
```

The API is served at `http://localhost:8080` (Vite + Express middleware from `api/index.ts`).

### 3. Forward webhooks to your machine

In a **second terminal**:

```bash
stripe listen --forward-to localhost:8080/api/webhook
```

The CLI prints a signing secret like:

```text
Ready! Your webhook signing secret is whsec_xxxxxxxxxxxx
```

Copy that value into `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # from stripe listen output
STRIPE_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=http://localhost:8080
```

Restart `npm run dev` after changing `.env`.

### 4. Trigger test events (optional)

With `stripe listen` running:

```bash
# Simulate a successful subscription invoice
stripe trigger invoice.payment_succeeded

# Simulate a failed renewal payment
stripe trigger invoice.payment_failed

# Subscription lifecycle
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

For realistic flows, complete a test subscription in the UI using [Stripe test cards](https://docs.stripe.com/testing#cards):

| Card | Behavior |
|------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Generic decline |
| `4000 0000 0000 3220` | 3D Secure required |

### 5. Verify locally

- Terminal running `stripe listen` should show `200` responses for delivered events.
- Server logs: `[Webhook] Order ... created` or `[Webhook] Payment failed for subscription ...`
- Failed payments should send emails if `RESEND_API_KEY` is set.

---

## Production (Stripe Live mode on Vercel)

### 1. Deploy the app

Ensure production is deployed to Vercel with Live Stripe keys:

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
FRONTEND_URL=https://your-production-domain.com
RESEND_API_KEY=re_...
```

Do **not** set `STRIPE_WEBHOOK_SECRET` until step 3 (you need the secret from the Dashboard endpoint).

### 2. Create the webhook endpoint in Stripe Dashboard

1. Open [Stripe Dashboard](https://dashboard.stripe.com) and switch to **Live** mode (toggle top-right).
2. Go to **Developers → Webhooks**.
3. Click **Add endpoint**.
4. **Endpoint URL:**

   ```text
   https://your-production-domain.com/api/webhook
   ```

   Example: `https://bolsadecafe.vercel.app/api/webhook`

5. **Events to listen to** — select exactly these four:

   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

6. Click **Add endpoint**.

### 3. Copy the signing secret to Vercel

1. On the new endpoint page, click **Reveal** under **Signing secret** (`whsec_...`).
2. In Vercel: **Project → Settings → Environment Variables**
3. Add or update:

   ```text
   STRIPE_WEBHOOK_SECRET = whsec_...   (Production only)
   ```

4. **Redeploy** the project so the new env var is picked up.

### 4. Smoke-test in production

1. In Stripe Dashboard → Webhooks → your endpoint → **Send test webhook** (Live endpoints can use test events from Dashboard in some cases; safer: use a real test-mode endpoint on staging first).
2. Or complete one small real subscription and confirm:
   - Order appears in Admin → Suscripciones
   - Admin receives new-order email
   - Stripe webhook log shows **200** delivery

---

## Staging / preview deployments (optional)

Each Vercel preview URL is a different host. Options:

**A. Separate Stripe Test endpoint per staging URL**

- Create another webhook in **Test mode** pointing to  
  `https://your-preview-xxx.vercel.app/api/webhook`
- Set `STRIPE_WEBHOOK_SECRET` for **Preview** environment in Vercel to that endpoint’s secret.

**B. Local + Stripe CLI only for dev**

- Use CLI forwarding for local work; use one production Live endpoint only for prod.

---

## Troubleshooting

### `Webhook signature verification failed`

- `STRIPE_WEBHOOK_SECRET` does not match the endpoint that sent the event.
- Common causes:
  - Using CLI secret while Stripe Dashboard sends to production URL (or reverse).
  - Test secret with Live keys.
  - Forgot to redeploy after updating Vercel env vars.

### Webhooks return `500` — Webhook secret not configured

- `STRIPE_WEBHOOK_SECRET` is missing in the environment running the API.

### Events delivered but no order created

- Subscription row may not exist yet when webhook runs (initial checkout creates order in API as backup).
- Check logs for: `Subscription not found in DB: sub_...`
- Check idempotency: `Invoice inv_... already processed, skipping`

### Stripe shows retries / failures

- Fix the underlying 500 (DB connection, missing env, unhandled error).
- Stripe retries automatically; handler is idempotent for `invoice.payment_succeeded`.

### Raw body / signature issues

The webhook route is registered **before** `express.json()` so Stripe receives the raw body required for `stripe.webhooks.constructEvent()`. Do not add global JSON parsing ahead of `/api/webhook`.

---

## Checklist

### Development

- [ ] Stripe CLI installed and logged in
- [ ] `npm run dev` running on port 8080
- [ ] `stripe listen --forward-to localhost:8080/api/webhook` running
- [ ] `.env` has `sk_test_`, `pk_test_`, and CLI `whsec_`
- [ ] Test subscription or `stripe trigger` returns 200

### Production

- [ ] Stripe Dashboard in **Live** mode
- [ ] Endpoint URL: `https://<domain>/api/webhook`
- [ ] All four events selected
- [ ] `STRIPE_WEBHOOK_SECRET` set in Vercel **Production**
- [ ] `STRIPE_SECRET_KEY` is `sk_live_...`
- [ ] Redeploy after env changes
- [ ] First live payment verified in Admin + Stripe webhook logs

---

## Related files

| File | Purpose |
|------|---------|
| [`api/index.ts`](../api/index.ts) | `handleWebhook`, event processors, email notifications |
| [`vercel.json`](../vercel.json) | Routes `/api/*` to serverless handler |
| [`.env.example`](../.env.example) | Environment variable template |
| [`README.md`](../README.md) | General project setup |
