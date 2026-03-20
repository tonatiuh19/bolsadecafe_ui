-- Migration: Add apartment_number and delivery_instructions to addresses table
-- Date: 2026-03-16
-- MySQL 8.0 (HostGator)

ALTER TABLE `addresses`
  ADD COLUMN `apartment_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `street_address_2`,
  ADD COLUMN `delivery_instructions` text COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `apartment_number`;
