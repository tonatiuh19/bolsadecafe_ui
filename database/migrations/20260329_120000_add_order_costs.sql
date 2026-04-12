-- Migration: Add shipping_label_cost and supply_cost to orders table
-- Date: 2026-03-29
-- MySQL 8.0 compatible (HostGator)

ALTER TABLE `orders`
  ADD COLUMN `shipping_label_cost` decimal(10,2) DEFAULT NULL COMMENT 'Cost of the shipping label paid to the carrier',
  ADD COLUMN `supply_cost`         decimal(10,2) DEFAULT NULL COMMENT 'Cost of supplies/packaging for this order';
