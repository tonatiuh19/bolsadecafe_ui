-- Migration: US shipping support
-- Date: 2026-07-31
-- Description:
--   - us_states table (50 states + DC)
--   - addresses: nullable state_id, state_code, country NOT NULL default MX
--   - subscription_plans: US Stripe price ID columns (MXN amounts 799/899/999)
--   - subscriptions: shipping_country column
--
-- After running: create 3 Stripe Products (test + live) and UPDATE the price IDs below.

-- ── US states ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `us_states` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `us_states` (`code`, `name`) VALUES
('AL','Alabama'),('AK','Alaska'),('AZ','Arizona'),('AR','Arkansas'),
('CA','California'),('CO','Colorado'),('CT','Connecticut'),('DE','Delaware'),
('DC','District of Columbia'),('FL','Florida'),('GA','Georgia'),('HI','Hawaii'),
('ID','Idaho'),('IL','Illinois'),('IN','Indiana'),('IA','Iowa'),
('KS','Kansas'),('KY','Kentucky'),('LA','Louisiana'),('ME','Maine'),
('MD','Maryland'),('MA','Massachusetts'),('MI','Michigan'),('MN','Minnesota'),
('MS','Mississippi'),('MO','Missouri'),('MT','Montana'),('NE','Nebraska'),
('NV','Nevada'),('NH','New Hampshire'),('NJ','New Jersey'),('NM','New Mexico'),
('NY','New York'),('NC','North Carolina'),('ND','North Dakota'),('OH','Ohio'),
('OK','Oklahoma'),('OR','Oregon'),('PA','Pennsylvania'),('RI','Rhode Island'),
('SC','South Carolina'),('SD','South Dakota'),('TN','Tennessee'),('TX','Texas'),
('UT','Utah'),('VT','Vermont'),('VA','Virginia'),('WA','Washington'),
('WV','West Virginia'),('WI','Wisconsin'),('WY','Wyoming')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ── Addresses: support US without mexico_states FK requirement ───────────
ALTER TABLE `addresses`
  MODIFY COLUMN `state_id` int(11) NULL,
  MODIFY COLUMN `country` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MX',
  ADD COLUMN `state_code` varchar(10) COLLATE utf8mb4_unicode_ci NULL AFTER `state_id`;

-- ── Subscription plans: US MXN Stripe prices (fee baked in) ──────────────
ALTER TABLE `subscription_plans`
  ADD COLUMN `stripe_price_id_us_test` varchar(255) NULL AFTER `stripe_price_id_prod`,
  ADD COLUMN `stripe_price_id_us_prod` varchar(255) NULL AFTER `stripe_price_id_us_test`,
  ADD COLUMN `price_mxn_us` decimal(10,2) NULL AFTER `price_mxn`;

-- Display/charge totals for US (base + 600 MXN intl fee)
UPDATE `subscription_plans` SET `price_mxn_us` = 850.00 WHERE `plan_id` = '250gr';
UPDATE `subscription_plans` SET `price_mxn_us` = 950.00 WHERE `plan_id` = '500gr';
UPDATE `subscription_plans` SET `price_mxn_us` = 1050.00 WHERE `plan_id` = '1kg';

-- Live Price IDs (from Stripe Dashboard Aug 2026)
UPDATE `subscription_plans` SET
  `stripe_price_id_us_prod` = 'price_1TzVJlP2VdesEhLQumge6Wvl'
WHERE `plan_id` = '250gr';

UPDATE `subscription_plans` SET
  `stripe_price_id_us_prod` = 'price_1TzVKPP2VdesEhLQkK9Nle7I'
WHERE `plan_id` = '500gr';

-- 1kg US live price
UPDATE `subscription_plans` SET
  `stripe_price_id_us_prod` = 'price_1TzVL4P2VdesEhLQu40dgyN8'
WHERE `plan_id` = '1kg';

-- Test Price IDs (from Stripe Dashboard Aug 2026)
UPDATE `subscription_plans` SET
  `stripe_price_id_us_test` = 'price_1TzVct04sI0kP0GKPx1IU2LS'
WHERE `plan_id` = '250gr';

UPDATE `subscription_plans` SET
  `stripe_price_id_us_test` = 'price_1TzVdY04sI0kP0GKxqHjkR1A'
WHERE `plan_id` = '500gr';

UPDATE `subscription_plans` SET
  `stripe_price_id_us_test` = 'price_1TzVdr04sI0kP0GKAgqYXStb'
WHERE `plan_id` = '1kg';

-- ── Subscriptions: remember shipping country for renewals / admin ────────
ALTER TABLE `subscriptions`
  ADD COLUMN `shipping_country` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MX'
    AFTER `shipping_address_id`;
