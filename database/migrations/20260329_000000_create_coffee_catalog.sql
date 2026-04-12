-- Migration: Create coffee_catalog table and add coffee_catalog_id to orders
-- Date: 2026-03-29
-- MySQL 8.0 compatible (HostGator)

-- ─── 1. Create coffee_catalog table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `coffee_catalog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `origin` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'State or region of origin in Mexico',
  `coffee_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g. Arábica, Robusta',
  `variety` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g. Bourbon, Typica, Caturra, Geisha',
  `process` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g. Natural, Lavado, Honey, Anaeróbico',
  `roast_level` enum('light','medium_light','medium','medium_dark','dark') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `altitude_min` int(11) DEFAULT NULL COMMENT 'Minimum altitude in meters above sea level',
  `altitude_max` int(11) DEFAULT NULL COMMENT 'Maximum altitude in meters above sea level',
  `tasting_notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Comma-separated tasting notes e.g. chocolate, caramelo, frutas rojas',
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by_admin_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_coffee_catalog_is_active` (`is_active`),
  KEY `idx_coffee_catalog_provider` (`provider`),
  KEY `fk_coffee_catalog_admin` (`created_by_admin_id`),
  CONSTRAINT `fk_coffee_catalog_admin` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 2. Add coffee_catalog_id column to orders ───────────────────────────────

ALTER TABLE `orders`
  ADD COLUMN `coffee_catalog_id` int(11) DEFAULT NULL COMMENT 'FK to coffee_catalog — the specific coffee batch sent in this order',
  ADD KEY `fk_order_coffee_catalog` (`coffee_catalog_id`),
  ADD CONSTRAINT `fk_order_coffee_catalog` FOREIGN KEY (`coffee_catalog_id`) REFERENCES `coffee_catalog` (`id`) ON DELETE SET NULL;
