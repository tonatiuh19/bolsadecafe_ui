-- Migration: Add OTP columns to admins table for passwordless login
-- Date: 2026-03-19

ALTER TABLE `admins`
  ADD COLUMN `otp_code` INT(6) NULL DEFAULT NULL AFTER `last_login`,
  ADD COLUMN `otp_expires_at` DATETIME NULL DEFAULT NULL AFTER `otp_code`;
