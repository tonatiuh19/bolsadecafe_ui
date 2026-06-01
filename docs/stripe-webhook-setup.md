# Stripe Webhook Setup Guide

## Overview

The webhook endpoint is `POST /api/webhook`. It handles four Stripe events:

| Event                           | Effect                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `invoice.payment_succeeded`     | Creates `order` + `payment` + `order_item` records; syncs subscription period dates |
| `invoice.payment_failed`        | Sets subscription `status = 'past_due'`; records failed payment                     |
| `customer.subscription.updated` | Syncs status, period dates, `cancel_at_period_end` from Stripe to DB                |
| `customer.subscription.deleted` | Marks subscription `status = 'cancelled'`                                           |

**Production site:** [https://www.bolsadecafe.com](https://www.bolsadecafe.com)

---

## 1. Run the database migration

Before Stripe sends any events you need the `stripe_invoice_id` column on the `orders` table. Run the migration on your HostGator MySQL database:

```sql
-- File: database/migrations/20260319_000000_add_stripe_invoice_id_to_orders.sql
ALTER TABLE `orders`
  ADD COLUMN `stripe_invoice_id` VARCHAR(255) NULL
    AFTER `stripe_payment_intent_id`,
  ADD UNIQUE KEY `uq_orders_stripe_invoice_id` (`stripe_invoice_id`);
```

---

## 2. Local development

### Install the Stripe CLI

```bash
# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# Verify
stripe --version
```

### Log in to your Stripe account

```bash
stripe login
```

This opens the browser to authenticate. Your credentials are cached locally.

### Forward webhooks to your dev server

```bash
stripe listen --forward-to localhost:8080/api/webhook
```

The CLI will print your **local webhook signing secret**:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

Copy it and add it to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

> **Important:** This secret is different from your production webhook secret. Use the CLI-printed value only for local development.

### Trigger a test event manually

With the listener running, open a second terminal and trigger events:

```bash
# Simulate a successful renewal payment
stripe trigger invoice.payment_succeeded

# Simulate a failed payment
stripe trigger invoice.payment_failed

# Simulate a subscription being updated
stripe trigger customer.subscription.updated

# Simulate a subscription being cancelled by Stripe
stripe trigger customer.subscription.deleted
```

You should see the events appear in both terminal windows and the corresponding rows in your `orders`, `payments`, and `subscriptions` tables.

---

## 3. Production (Vercel — bolsadecafe.com)

### Step 1 — Production webhook URL

```
https://www.bolsadecafe.com/api/webhook
```

Ensure the custom domain is configured in Vercel and DNS is propagated before creating the Stripe endpoint.

### Step 2 — Create the webhook endpoint in Stripe Dashboard

1. Switch Stripe to **Live mode** (top-right toggle)
2. Go to [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
3. Click **+ Add endpoint**
4. Set **Endpoint URL** to `https://www.bolsadecafe.com/api/webhook`
5. Under **Events to send**, select these four events:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Click **Add endpoint**

### Step 3 — Copy the signing secret

On the webhook detail page, click **Reveal** next to **Signing secret**. It starts with `whsec_`.

### Step 4 — Add the secret to Vercel environment variables

1. Vercel project → **Settings → Environment Variables**
2. Add:
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_xxxxxxxxxxxxxxxxxxxx` (the secret from Step 3)
   - **Environment:** Production
3. Click **Save**
4. **Redeploy** the production deployment so the new env var is picked up

Also confirm these live-mode vars are set (see [production-rollout.md](./production-rollout.md)):

- `STRIPE_SECRET_KEY=sk_live_...`
- `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- `FRONTEND_URL=https://www.bolsadecafe.com`

### Step 5 — Verify the endpoint is working

After deploying, go back to the Stripe Dashboard webhook page and click **Send test webhook** → choose `invoice.payment_succeeded`. The response should show `200 OK` with body `{"received":true}`.

---

## 4. Test mode vs live mode

Stripe webhooks are environment-specific:

| Mode     | Stripe keys                   | Dashboard section                                                |
| -------- | ----------------------------- | ---------------------------------------------------------------- |
| **Test** | `sk_test_...` / `pk_test_...` | [Test mode webhooks](https://dashboard.stripe.com/test/webhooks) |
| **Live** | `sk_live_...` / `pk_live_...` | [Live mode webhooks](https://dashboard.stripe.com/webhooks)      |

You need a **separate webhook endpoint** (with its own `whsec_` secret) for each mode. Set the correct secret in:

- `.env` for local dev (using Stripe CLI's printed secret)
- Vercel Preview env for staging (optional, with test keys)
- Vercel Production env for live

---

## 5. Required environment variables summary

```env
# .env (local)
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # from: stripe listen output (local)
                                   # or Stripe Dashboard (production)
FRONTEND_URL=http://localhost:8080
```

---

## 6. Troubleshooting

### Webhook returns 400 "Webhook signature error"

- Make sure `STRIPE_WEBHOOK_SECRET` matches the secret shown in the Stripe Dashboard (or CLI)
- Do **not** mix test and live secrets
- The webhook route must be registered before `express.json()` so the body arrives as a raw `Buffer` — this is already done in the code

### Events arrive but nothing is written to DB

- Check Vercel function logs for `[Webhook]` prefixed lines
- Verify the migration was run — if `stripe_invoice_id` column is missing the `INSERT` will fail
- Confirm your DB env vars (`DB_HOST`, `DB_USER`, etc.) are set correctly in Vercel

### Duplicate events / idempotency

Stripe retries events on non-2xx responses. The `UNIQUE` constraint on `orders.stripe_invoice_id` prevents duplicate order rows. The webhook returns `500` (not `200`) on DB errors so Stripe will retry — this is intentional.

### Testing renewals end-to-end locally

Subscriptions created with Stripe test clock can simulate time passing without waiting a real month:

1. In Stripe Dashboard (test mode) → **Test clocks** → **New test clock**
2. Create a customer using that test clock
3. Create a subscription for that customer via the API
4. Advance the test clock past the renewal date
5. Stripe fires `invoice.payment_succeeded` → the CLI forwards it → your handler creates the renewal order
