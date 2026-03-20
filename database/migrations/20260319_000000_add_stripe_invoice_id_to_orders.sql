-- Migration: Add stripe_invoice_id to orders table
-- Purpose: Link each order row to a Stripe Invoice; used for idempotency
--          in the webhook handler so we never create duplicate order records
--          for the same billing cycle.
-- MySQL 8.0 compatible (HostGator)

ALTER TABLE `orders`
  ADD COLUMN `stripe_invoice_id` VARCHAR(255) NULL
    COMMENT 'Stripe Invoice ID — used for idempotent webhook processing'
    AFTER `stripe_payment_intent_id`,
  ADD UNIQUE KEY `uq_orders_stripe_invoice_id` (`stripe_invoice_id`);
