-- Migration: Add shipment_provider and estimated_delivery to orders table
-- Date: 2026-03-19 12:00:00
-- Description: Adds fields needed for admin shipping pipeline

ALTER TABLE `orders`
  ADD COLUMN `shipment_provider` VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `tracking_number`,
  ADD COLUMN `estimated_delivery` DATE DEFAULT NULL AFTER `shipment_provider`;
