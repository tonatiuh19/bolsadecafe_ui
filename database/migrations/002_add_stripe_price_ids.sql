-- Migration: Add Stripe Price IDs for Test and Production environments
-- Date: 2026-01-24
-- Description: Add separate columns for test and production Stripe Price IDs
--
-- INSTRUCTIONS:
-- 1. Create Products and Prices in Stripe Dashboard:
--    TEST (https://dashboard.stripe.com/test/products):
--      - Product: "Bolsa de Café 250gr" → Add Price: $199 MXN recurring monthly
--      - Product: "Bolsa de Café 500gr" → Add Price: $299 MXN recurring monthly  
--      - Product: "Bolsa de Café 1kg" → Add Price: $399 MXN recurring monthly
--    PRODUCTION (https://dashboard.stripe.com/products):
--      - Same products and prices as test
-- 2. Replace the placeholder values below with your actual Price IDs before running
-- 3. Run this migration: mysql -u [user] -p alanchat_bolsadecafe < 002_add_stripe_price_ids.sql

USE alanchat_bolsadecafe;

-- Add new columns for test and production Stripe Price IDs
ALTER TABLE subscription_plans 
ADD COLUMN stripe_price_id_test VARCHAR(255) NULL AFTER stripe_price_id,
ADD COLUMN stripe_price_id_prod VARCHAR(255) NULL AFTER stripe_price_id_test;

-- Update 250gr plan with Stripe Price IDs
-- TEST: Replace with your test mode price_xxxxx from Stripe Dashboard
-- PROD: Replace with your live mode price_xxxxx from Stripe Dashboard
UPDATE subscription_plans 
SET 
  stripe_price_id_test = 'price_1RPwwG04sI0kP0GKbbE7YVGU',
  stripe_price_id_prod = 'price_xxxxx_prod_250gr_replace_me'
WHERE plan_id = '250gr';

-- Update 500gr plan with Stripe Price IDs
UPDATE subscription_plans 
SET 
  stripe_price_id_test = 'price_1RPwve04sI0kP0GKzEOTG5X2',
  stripe_price_id_prod = 'price_xxxxx_prod_500gr_replace_me'
WHERE plan_id = '500gr';

-- Update 1kg plan with Stripe Price IDs
UPDATE subscription_plans 
SET 
  stripe_price_id_test = 'price_1RPwvF04sI0kP0GKHrCkDAfS',
  stripe_price_id_prod = 'price_xxxxx_prod_1kg_replace_me'
WHERE plan_id = '1kg';

-- Business plan doesn't need Stripe prices (requires contact)
-- Leave test and prod price IDs as NULL

-- Verify the updates
SELECT 
  plan_id, 
  name, 
  price_mxn, 
  stripe_price_id_test,
  stripe_price_id_prod,
  is_active 
FROM subscription_plans 
ORDER BY id;
