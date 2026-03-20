-- =====================================================
-- Migration: Create visitor_events tracking table
-- Date: 2026-03-17
-- Description: Full visitor analytics tracking —
--   captures page views, custom events, UTM params,
--   device/browser info, and geo metadata.
-- =====================================================

CREATE TABLE IF NOT EXISTS `visitor_events` (
  `id`            BIGINT NOT NULL AUTO_INCREMENT,
  `session_id`    VARCHAR(64) NOT NULL COMMENT 'Client-generated UUID stored in sessionStorage',
  `user_id`       INT DEFAULT NULL COMMENT 'FK to users.id — null for anonymous visitors',
  `event_type`    ENUM(
                    'page_view',
                    'click',
                    'scroll',
                    'form_submit',
                    'subscription_start',
                    'subscription_complete',
                    'auth_open',
                    'auth_success',
                    'plan_select',
                    'checkout_start',
                    'checkout_complete',
                    'payment_method_added',
                    'payment_method_removed'
                  ) NOT NULL DEFAULT 'page_view',
  `page`          VARCHAR(500) NOT NULL COMMENT 'Path + query string of the page (e.g. /subscription-wizard?step=2)',
  `referrer`      VARCHAR(500) DEFAULT NULL COMMENT 'HTTP Referer header or document.referrer',
  `utm_source`    VARCHAR(255) DEFAULT NULL,
  `utm_medium`    VARCHAR(255) DEFAULT NULL,
  `utm_campaign`  VARCHAR(255) DEFAULT NULL,
  `utm_term`      VARCHAR(255) DEFAULT NULL,
  `utm_content`   VARCHAR(255) DEFAULT NULL,
  `ip_address`    VARCHAR(45) DEFAULT NULL COMMENT 'IPv4 or IPv6 — populated server-side',
  `user_agent`    TEXT DEFAULT NULL COMMENT 'Full UA string — populated server-side',
  `device_type`   ENUM('desktop', 'mobile', 'tablet', 'unknown') NOT NULL DEFAULT 'unknown',
  `browser`       VARCHAR(100) DEFAULT NULL COMMENT 'Detected browser name (Chrome, Safari, Firefox…)',
  `os`            VARCHAR(100) DEFAULT NULL COMMENT 'Detected OS (Windows, macOS, iOS, Android…)',
  `country_code`  VARCHAR(2) DEFAULT NULL COMMENT 'ISO 3166-1 alpha-2 (populated via CF-IPCountry header)',
  `duration_ms`   INT DEFAULT NULL COMMENT 'Time on page in ms — sent on navigation away',
  `metadata`      JSON DEFAULT NULL COMMENT 'Arbitrary extra payload (selected plan id, step number, etc.)',
  `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_ve_session`    (`session_id`),
  KEY `idx_ve_user`       (`user_id`),
  KEY `idx_ve_event_type` (`event_type`),
  KEY `idx_ve_created`    (`created_at`),
  KEY `idx_ve_page`       (`page`(191)),

  CONSTRAINT `fk_ve_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Visitor analytics — page views and custom frontend events';
