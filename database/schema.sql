-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 25, 2026 at 01:28 PM
-- Server version: 5.7.23-23
-- PHP Version: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `alanchat_bolsadecafe`
--

-- --------------------------------------------------------

--
-- Stand-in structure for view `active_subscriptions_view`
-- (See below for the actual view)
--
CREATE TABLE `active_subscriptions_view` (
`id` int(11)
,`email` varchar(255)
,`full_name` varchar(255)
,`plan_name` varchar(255)
,`price_mxn` decimal(10,2)
,`grind_type` varchar(100)
,`status` enum('active','cancelled','paused','past_due','incomplete','trialing')
,`current_period_start` date
,`current_period_end` date
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address_type` enum('shipping','billing') COLLATE utf8mb4_unicode_ci DEFAULT 'shipping',
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `street_address` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `street_address_2` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_id` int(11) NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT 'MX',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('super_admin','admin','support') COLLATE utf8mb4_unicode_ci DEFAULT 'admin',
  `is_active` tinyint(1) DEFAULT '1',
  `bio` text COLLATE utf8mb4_unicode_ci,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `is_active`, `bio`, `avatar_url`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@bolsadecafe.com', '$2b$10$rKvvKT0hqPZj8wy5zM5h0.OzKLcXxNQ3RgVSNKZ5vJQgJxMxJQxQy', 'Administrador Principal', 'super_admin', 1, 'Administrador y editor principal de Bolsa de Café', NULL, NULL, '2026-01-24 19:03:20', '2026-01-24 19:03:20');

-- --------------------------------------------------------

--
-- Table structure for table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resource_id` int(11) DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_categories`
--

CREATE TABLE `blog_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int(11) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_categories`
--

INSERT INTO `blog_categories` (`id`, `name`, `slug`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Recetas de Café', 'recetas', 'Recetas y preparaciones de café', 1, 1, '2026-01-24 19:03:19', '2026-01-24 19:03:19'),
(2, 'Cultura del Café', 'cultura', 'Historia, origen y cultura cafetera', 2, 1, '2026-01-24 19:03:19', '2026-01-24 19:03:19'),
(3, 'Guías y Tips', 'guias', 'Guías de preparación y consejos', 3, 1, '2026-01-24 19:03:19', '2026-01-24 19:03:19'),
(4, 'Noticias', 'noticias', 'Noticias y actualizaciones', 4, 1, '2026-01-24 19:03:19', '2026-01-24 19:03:19'),
(5, 'Productores', 'productores', 'Historias de nuestros productores', 5, 1, '2026-01-24 19:03:19', '2026-01-24 19:03:19');

-- --------------------------------------------------------

--
-- Table structure for table `blog_comments`
--

CREATE TABLE `blog_comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `author_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','spam','trash') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `featured_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `published_at` datetime DEFAULT NULL,
  `views` int(11) DEFAULT '0',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `blog_posts_with_author`
-- (See below for the actual view)
--
CREATE TABLE `blog_posts_with_author` (
`id` int(11)
,`title` varchar(255)
,`slug` varchar(255)
,`excerpt` text
,`featured_image` varchar(500)
,`status` enum('draft','published','archived')
,`published_at` datetime
,`views` int(11)
,`created_at` timestamp
,`author_name` varchar(255)
,`author_email` varchar(255)
,`author_avatar` varchar(500)
,`category_name` varchar(100)
,`category_slug` varchar(100)
);

-- --------------------------------------------------------

--
-- Table structure for table `blog_post_tags`
--

CREATE TABLE `blog_post_tags` (
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_tags`
--

CREATE TABLE `blog_tags` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `business_inquiries`
--

CREATE TABLE `business_inquiries` (
  `id` int(11) NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monthly_consumption` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employees_count` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_supplier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `status` enum('new','contacted','quoted','converted','declined') COLLATE utf8mb4_unicode_ci DEFAULT 'new',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `assigned_to_admin_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grind_types`
--

CREATE TABLE `grind_types` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int(11) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grind_types`
--

INSERT INTO `grind_types` (`id`, `name`, `code`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Grano Entero', 'whole_bean', 'Granos enteros sin moler - ideal para moler en casa y obtener máxima frescura', 1, 1, '2026-01-24 19:03:19', '2026-01-24 19:03:19'),
(2, 'Molido Grueso', 'coarse', 'Molido grueso - ideal para prensa francesa y cold brew', 2, 1, '2026-01-24 19:03:19', '2026-01-24 19:03:19'),
(3, 'Molido Medio', 'medium', 'Molido medio - ideal para cafeteras de goteo y pour over', 3, 1, '2026-01-24 19:03:19', '2026-01-24 19:03:19'),
(4, 'Molido Fino', 'fine', 'Molido fino - ideal para espresso y moka italiana', 4, 1, '2026-01-24 19:03:19', '2026-01-24 19:03:19'),
(5, 'Molido Extra Fino', 'extra_fine', 'Molido extra fino - ideal para café turco', 5, 1, '2026-01-24 19:03:19', '2026-01-24 19:03:19');

-- --------------------------------------------------------

--
-- Table structure for table `mexico_states`
--

CREATE TABLE `mexico_states` (
  `id` int(11) NOT NULL,
  `code` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mexico_states`
--

INSERT INTO `mexico_states` (`id`, `code`, `name`, `is_active`, `created_at`) VALUES
(1, 'AGU', 'Aguascalientes', 1, '2026-01-24 19:03:19'),
(2, 'BCN', 'Baja California', 1, '2026-01-24 19:03:19'),
(3, 'BCS', 'Baja California Sur', 1, '2026-01-24 19:03:19'),
(4, 'CAM', 'Campeche', 1, '2026-01-24 19:03:19'),
(5, 'CHP', 'Chiapas', 1, '2026-01-24 19:03:19'),
(6, 'CHH', 'Chihuahua', 1, '2026-01-24 19:03:19'),
(7, 'COA', 'Coahuila', 1, '2026-01-24 19:03:19'),
(8, 'COL', 'Colima', 1, '2026-01-24 19:03:19'),
(9, 'CMX', 'Ciudad de México', 1, '2026-01-24 19:03:19'),
(10, 'DUR', 'Durango', 1, '2026-01-24 19:03:19'),
(11, 'GUA', 'Guanajuato', 1, '2026-01-24 19:03:19'),
(12, 'GRO', 'Guerrero', 1, '2026-01-24 19:03:19'),
(13, 'HID', 'Hidalgo', 1, '2026-01-24 19:03:19'),
(14, 'JAL', 'Jalisco', 1, '2026-01-24 19:03:19'),
(15, 'MEX', 'Estado de México', 1, '2026-01-24 19:03:19'),
(16, 'MIC', 'Michoacán', 1, '2026-01-24 19:03:19'),
(17, 'MOR', 'Morelos', 1, '2026-01-24 19:03:19'),
(18, 'NAY', 'Nayarit', 1, '2026-01-24 19:03:19'),
(19, 'NLE', 'Nuevo León', 1, '2026-01-24 19:03:19'),
(20, 'OAX', 'Oaxaca', 1, '2026-01-24 19:03:19'),
(21, 'PUE', 'Puebla', 1, '2026-01-24 19:03:19'),
(22, 'QUE', 'Querétaro', 1, '2026-01-24 19:03:19'),
(23, 'ROO', 'Quintana Roo', 1, '2026-01-24 19:03:19'),
(24, 'SLP', 'San Luis Potosí', 1, '2026-01-24 19:03:19'),
(25, 'SIN', 'Sinaloa', 1, '2026-01-24 19:03:19'),
(26, 'SON', 'Sonora', 1, '2026-01-24 19:03:19'),
(27, 'TAB', 'Tabasco', 1, '2026-01-24 19:03:19'),
(28, 'TAM', 'Tamaulipas', 1, '2026-01-24 19:03:19'),
(29, 'TLA', 'Tlaxcala', 1, '2026-01-24 19:03:19'),
(30, 'VER', 'Veracruz', 1, '2026-01-24 19:03:19'),
(31, 'YUC', 'Yucatán', 1, '2026-01-24 19:03:19'),
(32, 'ZAC', 'Zacatecas', 1, '2026-01-24 19:03:19');

-- --------------------------------------------------------

--
-- Stand-in structure for view `monthly_revenue_view`
-- (See below for the actual view)
--
CREATE TABLE `monthly_revenue_view` (
`month` varchar(7)
,`total_orders` bigint(21)
,`total_revenue` decimal(32,2)
,`avg_order_value` decimal(14,6)
);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subscription_id` int(11) DEFAULT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stripe_payment_intent_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'MXN',
  `status` enum('pending','processing','shipped','delivered','cancelled','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `shipping_address_id` int(11) DEFAULT NULL,
  `billing_address_id` int(11) DEFAULT NULL,
  `grind_type_id` int(11) DEFAULT NULL,
  `tracking_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `subscription_id` int(11) DEFAULT NULL,
  `stripe_payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'MXN',
  `status` enum('pending','succeeded','failed','refunded','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `failure_reason` text COLLATE utf8mb4_unicode_ci,
  `refunded_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plan_features`
--

CREATE TABLE `plan_features` (
  `id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `feature_text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int(11) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `plan_features`
--

INSERT INTO `plan_features` (`id`, `plan_id`, `feature_text`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Café 100% mexicano premium', 1, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(2, 1, 'Perfecto para 1-2 personas', 2, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(3, 1, 'Envío gratis en toda la República', 3, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(4, 1, 'Cancela cuando quieras', 4, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(5, 1, 'Grano entero o molido a tu preferencia', 5, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(6, 1, 'Guía de preparación incluida', 6, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(7, 2, 'Café 100% mexicano premium', 1, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(8, 2, 'Ideal para 2-4 personas', 2, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(9, 2, 'Envío gratis en toda la República', 3, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(10, 2, 'Cancela cuando quieras', 4, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(11, 2, 'Grano entero o molido a tu preferencia', 5, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(12, 2, 'Notas de cata exclusivas', 6, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(13, 2, 'Acceso a café de temporada', 7, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(14, 3, 'Café 100% mexicano premium', 1, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(15, 3, 'Perfecto para familias o oficinas (5+ personas)', 2, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(16, 3, 'Envío gratis en toda la República', 3, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(17, 3, 'Cancela cuando quieras', 4, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(18, 3, 'Grano entero o molido a tu preferencia', 5, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(19, 3, 'Mix de variedades cada mes', 6, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(20, 3, 'Descuento en compras adicionales', 7, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54'),
(21, 3, 'Acceso prioritario a cafés exclusivos', 8, 1, '2026-01-24 19:50:54', '2026-01-24 19:50:54');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `grind_type_id` int(11) NOT NULL,
  `shipping_address_id` int(11) DEFAULT NULL,
  `stripe_subscription_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','cancelled','paused','past_due','incomplete','trialing') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `current_period_start` date DEFAULT NULL,
  `current_period_end` date DEFAULT NULL,
  `cancel_at_period_end` tinyint(1) DEFAULT '0',
  `cancelled_at` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL,
  `plan_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'For business plan, this is shown in the modal header',
  `weight` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_mxn` decimal(10,2) NOT NULL,
  `stripe_price_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_price_id_test` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_price_id_prod` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `requires_contact` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `plan_id`, `name`, `description`, `weight`, `price_mxn`, `stripe_price_id`, `stripe_price_id_test`, `stripe_price_id_prod`, `is_active`, `requires_contact`, `created_at`, `updated_at`) VALUES
(1, '250gr', 'Bolsa de Café 250gr', 'Café de especialidad, tostado artesanal, 250 gramos', '250gr', 199.00, NULL, 'price_1RPwwG04sI0kP0GKbbE7YVGU', 'price_xxxxx_prod_250gr_replace_me', 1, 0, '2026-01-24 19:03:19', '2026-01-24 22:01:07'),
(2, '500gr', 'Bolsa de Café 500gr', 'Café de especialidad, tostado artesanal, 500 gramos', '500gr', 299.00, NULL, 'price_1RPwve04sI0kP0GKzEOTG5X2', 'price_xxxxx_prod_500gr_replace_me', 1, 0, '2026-01-24 19:03:19', '2026-01-24 22:01:07'),
(3, '1kg', 'Bolsa de Café 1kg', 'Café de especialidad, tostado artesanal, 1 kilogramo', '1kg', 399.00, NULL, 'price_1RPwvF04sI0kP0GKHrCkDAfS', 'price_xxxxx_prod_1kg_replace_me', 1, 0, '2026-01-24 19:03:19', '2026-01-24 22:01:07'),
(4, 'business', 'Suscripción Personalizada para Tu Negocio', 'Solución personalizada de café para tu oficina o negocio. Incluye consultoría, descuentos por volumen, facturación flexible y café adaptado a tus necesidades específicas.', 'personalizado', 0.00, NULL, NULL, NULL, 1, 1, '2026-01-24 19:34:52', '2026-01-24 19:36:56');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_customer_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `full_name`, `phone`, `password_hash`, `stripe_customer_id`, `email_verified`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'axgoomez@gmail.com', 'Felix Gomez', '+524741400363', NULL, NULL, 1, 1, '2026-01-24 21:03:56', '2026-01-24 21:04:12');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verification_code` int(6) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `expires_at` datetime NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `email`, `verification_code`, `is_active`, `expires_at`, `ip_address`, `user_agent`, `created_at`) VALUES
(3, 1, 'axgoomez@gmail.com', 930448, 0, '2026-01-25 11:53:59', NULL, NULL, '2026-01-25 17:38:59');

-- --------------------------------------------------------

--
-- Table structure for table `webhook_events`
--

CREATE TABLE `webhook_events` (
  `id` int(11) NOT NULL,
  `stripe_event_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `processed` tinyint(1) DEFAULT '0',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure for view `active_subscriptions_view`
--
DROP TABLE IF EXISTS `active_subscriptions_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_subscriptions_view`  AS SELECT `s`.`id` AS `id`, `u`.`email` AS `email`, `u`.`full_name` AS `full_name`, `sp`.`name` AS `plan_name`, `sp`.`price_mxn` AS `price_mxn`, `gt`.`name` AS `grind_type`, `s`.`status` AS `status`, `s`.`current_period_start` AS `current_period_start`, `s`.`current_period_end` AS `current_period_end`, `s`.`created_at` AS `created_at` FROM (((`subscriptions` `s` join `users` `u` on((`s`.`user_id` = `u`.`id`))) join `subscription_plans` `sp` on((`s`.`plan_id` = `sp`.`id`))) join `grind_types` `gt` on((`s`.`grind_type_id` = `gt`.`id`))) WHERE (`s`.`status` in ('active','trialing')) ;

-- --------------------------------------------------------

--
-- Structure for view `blog_posts_with_author`
--
DROP TABLE IF EXISTS `blog_posts_with_author`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `blog_posts_with_author`  AS SELECT `bp`.`id` AS `id`, `bp`.`title` AS `title`, `bp`.`slug` AS `slug`, `bp`.`excerpt` AS `excerpt`, `bp`.`featured_image` AS `featured_image`, `bp`.`status` AS `status`, `bp`.`published_at` AS `published_at`, `bp`.`views` AS `views`, `bp`.`created_at` AS `created_at`, `a`.`full_name` AS `author_name`, `a`.`email` AS `author_email`, `a`.`avatar_url` AS `author_avatar`, `bc`.`name` AS `category_name`, `bc`.`slug` AS `category_slug` FROM ((`blog_posts` `bp` join `admins` `a` on((`bp`.`author_id` = `a`.`id`))) left join `blog_categories` `bc` on((`bp`.`category_id` = `bc`.`id`))) ;

-- --------------------------------------------------------

--
-- Structure for view `monthly_revenue_view`
--
DROP TABLE IF EXISTS `monthly_revenue_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `monthly_revenue_view`  AS SELECT date_format(`orders`.`created_at`,'%Y-%m') AS `month`, count(0) AS `total_orders`, sum(`orders`.`total_amount`) AS `total_revenue`, avg(`orders`.`total_amount`) AS `avg_order_value` FROM `orders` WHERE (`orders`.`status` not in ('cancelled','refunded')) GROUP BY date_format(`orders`.`created_at`,'%Y-%m') ORDER BY `month` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_state_id` (`state_id`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_username` (`username`);

--
-- Indexes for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_id` (`admin_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_action` (`action`);

--
-- Indexes for table `blog_categories`
--
ALTER TABLE `blog_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- Indexes for table `blog_comments`
--
ALTER TABLE `blog_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_author_id` (`author_id`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_published_at` (`published_at`),
  ADD KEY `idx_blog_posts_status_published` (`status`,`published_at`);
ALTER TABLE `blog_posts` ADD FULLTEXT KEY `idx_search` (`title`,`excerpt`,`content`);

--
-- Indexes for table `blog_post_tags`
--
ALTER TABLE `blog_post_tags`
  ADD PRIMARY KEY (`post_id`,`tag_id`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_tag_id` (`tag_id`);

--
-- Indexes for table `blog_tags`
--
ALTER TABLE `blog_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`);

--
-- Indexes for table `business_inquiries`
--
ALTER TABLE `business_inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_to_admin_id` (`assigned_to_admin_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `grind_types`
--
ALTER TABLE `grind_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- Indexes for table `mexico_states`
--
ALTER TABLE `mexico_states`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `subscription_id` (`subscription_id`),
  ADD KEY `shipping_address_id` (`shipping_address_id`),
  ADD KEY `billing_address_id` (`billing_address_id`),
  ADD KEY `grind_type_id` (`grind_type_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_orders_user_status` (`user_id`,`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `idx_order_id` (`order_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stripe_payment_id` (`stripe_payment_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `subscription_id` (`subscription_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_stripe_payment_id` (`stripe_payment_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_payments_user_date` (`user_id`,`created_at`);

--
-- Indexes for table `plan_features`
--
ALTER TABLE `plan_features`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_plan_id` (`plan_id`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stripe_subscription_id` (`stripe_subscription_id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `grind_type_id` (`grind_type_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_stripe_subscription_id` (`stripe_subscription_id`),
  ADD KEY `idx_subscriptions_user_status` (`user_id`,`status`),
  ADD KEY `idx_shipping_address_id` (`shipping_address_id`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plan_id` (`plan_id`),
  ADD UNIQUE KEY `stripe_price_id` (`stripe_price_id`),
  ADD KEY `idx_plan_id` (`plan_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `stripe_customer_id` (`stripe_customer_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_stripe_customer_id` (`stripe_customer_id`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_verification_code` (`verification_code`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_email_active` (`email`,`is_active`),
  ADD KEY `idx_expires_at_active` (`expires_at`,`is_active`);

--
-- Indexes for table `webhook_events`
--
ALTER TABLE `webhook_events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stripe_event_id` (`stripe_event_id`),
  ADD KEY `idx_stripe_event_id` (`stripe_event_id`),
  ADD KEY `idx_event_type` (`event_type`),
  ADD KEY `idx_processed` (`processed`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `admin_logs`
--
ALTER TABLE `admin_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_categories`
--
ALTER TABLE `blog_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `blog_comments`
--
ALTER TABLE `blog_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_tags`
--
ALTER TABLE `blog_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `business_inquiries`
--
ALTER TABLE `business_inquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grind_types`
--
ALTER TABLE `grind_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `mexico_states`
--
ALTER TABLE `mexico_states`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `plan_features`
--
ALTER TABLE `plan_features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `webhook_events`
--
ALTER TABLE `webhook_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `addresses_ibfk_2` FOREIGN KEY (`state_id`) REFERENCES `mexico_states` (`id`);

--
-- Constraints for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blog_comments`
--
ALTER TABLE `blog_comments`
  ADD CONSTRAINT `blog_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blog_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `admins` (`id`),
  ADD CONSTRAINT `blog_posts_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `blog_post_tags`
--
ALTER TABLE `blog_post_tags`
  ADD CONSTRAINT `blog_post_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blog_post_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `blog_tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `business_inquiries`
--
ALTER TABLE `business_inquiries`
  ADD CONSTRAINT `business_inquiries_ibfk_1` FOREIGN KEY (`assigned_to_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`billing_address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_5` FOREIGN KEY (`grind_type_id`) REFERENCES `grind_types` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `plan_features`
--
ALTER TABLE `plan_features`
  ADD CONSTRAINT `plan_features_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_subscriptions_shipping_address` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`),
  ADD CONSTRAINT `subscriptions_ibfk_3` FOREIGN KEY (`grind_type_id`) REFERENCES `grind_types` (`id`);

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
