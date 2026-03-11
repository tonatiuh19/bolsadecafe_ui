-- Migration: Add shipping_address_id to subscriptions table
-- Date: 2026-01-24
-- Description: Link subscriptions to addresses for monthly deliveries

-- Add shipping_address_id column to subscriptions table
ALTER TABLE `subscriptions` 
ADD COLUMN `shipping_address_id` INT(11) NULL AFTER `grind_type_id`,
ADD KEY `idx_shipping_address_id` (`shipping_address_id`),
ADD CONSTRAINT `fk_subscriptions_shipping_address` 
  FOREIGN KEY (`shipping_address_id`) 
  REFERENCES `addresses` (`id`) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Optional: Update existing subscriptions to use user's default address
-- UPDATE subscriptions s
-- JOIN addresses a ON s.user_id = a.user_id AND a.is_default = 1 AND a.address_type = 'shipping'
-- SET s.shipping_address_id = a.id
-- WHERE s.shipping_address_id IS NULL;
