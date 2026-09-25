# US Shipping — Stripe & Ops Checklist

Bolsa de Café charges **always in MXN**. US plans use dedicated Stripe Products/Prices with the international fee baked in.

## Prices (monthly, MXN)

| Plan | MX Price | US Price (base + $650 fee) | ≈ USD @ 20 MXN |
|------|----------|----------------------------|----------------|
| 250gr | 199 | **850** | $42.50 |
| 500gr | 299 | **950** | $47.50 |
| 1kg | 399 | **1050** | $52.50 |

> Fee was raised by +50 MXN (600 → 650). Totals rounded to Stripe Price amounts.

## Create in Stripe (Test + Live)

For each mode, create **3 Products**:

1. `Bolsa de Café 250gr US` → recurring monthly **850 MXN**
2. `Bolsa de Café 500gr US` → recurring monthly **950 MXN**
3. `Bolsa de Café 1kg US` → recurring monthly **1050 MXN**

### Live Price IDs (set in DB)

| Plan | Amount | `stripe_price_id_us_prod` |
|------|--------|---------------------------|
| 250gr | 850 MXN | `price_1TzVJlP2VdesEhLQumge6Wvl` |
| 500gr | 950 MXN | `price_1TzVKPP2VdesEhLQkK9Nle7I` |
| 1kg | 1050 MXN | `price_1TzVL4P2VdesEhLQu40dgyN8` |

### Test Price IDs (set in DB)

| Plan | Amount | `stripe_price_id_us_test` |
|------|--------|---------------------------|
| 250gr | 850 MXN | `price_1TzVct04sI0kP0GKPx1IU2LS` |
| 500gr | 950 MXN | `price_1TzVdY04sI0kP0GKxqHjkR1A` |
| 1kg | 1050 MXN | `price_1TzVdr04sI0kP0GKAgqYXStb` |

## Migration already applied locally

`database/migrations/20260731_000000_add_us_shipping.sql`

- `us_states` (50 + DC)
- `addresses.state_id` nullable + `state_code`
- `subscription_plans.stripe_price_id_us_*` + `price_mxn_us`
- `subscriptions.shipping_country`

Run the same migration on any environment that does not have it yet.

## Checkout behavior

- Homepage `#envios-eeuu` announces U.S. shipping only (no price breakdown)
- Wizard step **País** → MX | US
- Homepage: announce U.S. shipping only (no prices)
- Plan step: **MXN Mexico only**
- Country step: **destination only** (no prices on cards or in summary/dock)
- After Continue with country = US (delivery → address → payment): show ≈USD breakdown + charged MXN
- Stripe always bills MXN
- Charge uses US Stripe Price ID (MXN)
- Postal validation: MX `#####`, US `#####` or `#####-####`
- Address edit (dashboard) is country-aware (`state_code` for US)
- Admin orders/subscriptions resolve US state names + show EE.UU. label
- Disclaimer + FAQ about bank FX conversion

## i18n

- `react-i18next` scaffolded (`client/i18n`)
- Browser detect + ES/EN toggle (`LanguageToggle`)
- Expand locale JSON files to cover remaining pages over time
