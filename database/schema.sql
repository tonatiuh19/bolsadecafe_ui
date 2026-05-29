-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 18, 2026 at 10:13 AM
-- Server version: 5.7.44-48
-- PHP Version: 8.3.31

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
  `apartment_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_instructions` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_id` int(11) NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT 'MX',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `address_type`, `full_name`, `street_address`, `street_address_2`, `apartment_number`, `delivery_instructions`, `city`, `state_id`, `postal_code`, `country`, `phone`, `is_default`, `created_at`, `updated_at`) VALUES
(2, 15, 'shipping', 'Felix Gomez', 'Calle Independencia 47', 'Col. Centro', NULL, 'Casa color azul, tocar timbre', 'Lagos de Moreno', 14, '47400', 'MX', '+524741400363', 1, '2026-04-24 23:04:35', '2026-04-24 23:04:35'),
(3, 15, 'shipping', 'Lionel MEssi', 'Calle Roja 47', 'Col. Chida', NULL, 'Casa color azul, tocar timbre', 'Zapopan', 14, '45230', 'MX', '+524741502356', 1, '2026-04-24 23:09:56', '2026-04-24 23:09:56');

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
  `otp_code` int(6) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `is_active`, `bio`, `avatar_url`, `last_login`, `otp_code`, `otp_expires_at`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'axgoomez@gmail.com', '$2b$10$rKvvKT0hqPZj8wy5zM5h0.OzKLcXxNQ3RgVSNKZ5vJQgJxMxJQxQy', 'Felix Gomez', 'super_admin', 1, 'Administrador y editor principal de Bolsa de Café', NULL, '2026-05-08 12:33:07', NULL, NULL, '2026-01-24 19:03:20', '2026-05-08 18:33:07'),
(2, 'leslie', 'lesliegcardona@gmail.com', '$2b$10$ZVUtk.snWaDHJj/4SeTyw.2UDv4Wgs2p201ESHACh5ruvM5YH0nTy', 'Leslie Gonzalez', 'super_admin', 1, NULL, NULL, '2026-05-07 22:17:39', NULL, NULL, '2026-03-20 04:28:49', '2026-05-08 04:17:39');

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

--
-- Dumping data for table `admin_logs`
--

INSERT INTO `admin_logs` (`id`, `admin_id`, `action`, `resource_type`, `resource_id`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 2, 'ship_order', 'order', 2, '{\"trackingNumber\":\"MSMSBIIW11222--3\",\"shipmentProvider\":\"AMPM\",\"estimatedDelivery\":\"2026-04-10\"}', NULL, NULL, '2026-03-23 02:54:31'),
(2, 2, 'deliver_order', 'order', 2, '{\"blogPostTitle\":\"CAFE ALARCON\"}', NULL, NULL, '2026-03-23 03:03:24'),
(3, 1, 'archive_blog_post', 'blog_post', 4, '{\"archived\":true}', NULL, NULL, '2026-03-30 02:38:40'),
(4, 2, 'ship_order', 'order', 1, '{\"trackingNumber\":\"MSMSBIIW11222--3\",\"shipmentProvider\":\"AMPM\",\"estimatedDelivery\":\"2026-04-01\",\"coffeeCatalogId\":null,\"shippingLabelCost\":null,\"supplyCost\":null}', NULL, NULL, '2026-03-30 03:17:11'),
(5, 2, 'create_coffee', 'coffee_catalog', 1, '{\"name\":\"Las Montañas \",\"provider\":\"RAMCAFE\"}', NULL, NULL, '2026-04-21 00:01:54'),
(6, 2, 'ship_order', 'order', 7, '{\"trackingNumber\":\"123456678899012\",\"shipmentProvider\":\"Estafeta\",\"estimatedDelivery\":\"2026-04-30\",\"coffeeCatalogId\":1,\"shippingLabelCost\":152,\"supplyCost\":null}', NULL, NULL, '2026-04-21 00:02:41'),
(7, 2, 'deliver_order', 'order', 7, '{\"blogPostTitle\":null}', NULL, NULL, '2026-04-21 00:04:24'),
(8, 2, 'ship_order', 'order', 4, '{\"trackingNumber\":\"123456678899012\",\"shipmentProvider\":\"Estafeta\",\"estimatedDelivery\":\"2026-04-30\",\"coffeeCatalogId\":1,\"shippingLabelCost\":10,\"supplyCost\":20}', NULL, NULL, '2026-04-25 05:33:18'),
(9, 2, 'archive_blog_post', 'blog_post', 2, '{\"archived\":true}', NULL, NULL, '2026-05-08 04:18:15'),
(10, 2, 'archive_blog_post', 'blog_post', 1, '{\"archived\":true}', NULL, NULL, '2026-05-08 04:18:18'),
(11, 2, 'archive_blog_post', 'blog_post', 3, '{\"archived\":true}', NULL, NULL, '2026-05-08 04:18:20'),
(12, 2, 'create_blog_post', 'blog_post', 5, '{\"title\":\"Los Mejores Estados Productores de Café en México: Origen, Sabor y Tradición en Cada Taza\",\"slug\":\"los-mejores-estados-productores-de-cafe-en-mexico-origen-sabor-y-tradicion-en-cada-taza\",\"status\":\"draft\"}', NULL, NULL, '2026-05-08 05:10:57'),
(13, 2, 'update_blog_post', 'blog_post', 5, '{\"title\":\"Los Mejores Estados Productores de Café en México: Origen, Sabor y Tradición en Cada Taza\",\"slug\":\"los-mejores-estados-productores-de-cafe-en-mexico-origen-sabor-y-tradicion-en-cada-taza\",\"status\":\"published\"}', NULL, NULL, '2026-05-08 05:11:20'),
(14, 2, 'update_blog_post', 'blog_post', 5, '{\"title\":\"Los Mejores Estados Productores de Café en México: Origen, Sabor y Tradición en Cada Taza\",\"slug\":\"los-mejores-estados-productores-de-cafe-en-mexico-origen-sabor-y-tradicion-en-cada-taza\",\"status\":\"published\"}', NULL, NULL, '2026-05-08 05:46:28');

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

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `slug`, `excerpt`, `content`, `featured_image`, `author_id`, `category_id`, `status`, `published_at`, `views`, `meta_title`, `meta_description`, `created_at`, `updated_at`) VALUES
(1, 'CAFE ALARCON', 'cafe-alarcon-1774235004479', NULL, 'El cafe alarcon sobresale por su sabor frutal..', NULL, 2, NULL, 'archived', '2026-03-22 21:03:24', 0, NULL, NULL, '2026-03-23 03:03:24', '2026-05-08 04:18:18'),
(2, 'La Guía Definitiva para Preparar Café de Especialidad en Casa', 'guia-definitiva-cafe-especialidad-en-casa', 'Prepara una taza extraordinaria sin salir de tu hogar. Desde elegir los granos correctos hasta dominar la temperatura del agua.', '<h2>¿Qué es el café de especialidad?</h2><p>El café de especialidad es aquel que obtiene una puntuación igual o superior a 80 puntos en la escala de la Specialty Coffee Association (SCA). Estos granos provienen de regiones específicas, son cosechados a mano y procesados con cuidado excepcional.</p><h2>Los elementos clave para una taza perfecta</h2><h3>1. El grano fresco lo es todo</h3><p>Un café pierde hasta el 60% de sus compuestos aromáticos en los primeros 15 días después de ser tostado. En <strong>Bolsa de Café</strong> enviamos granos tostados en los últimos 7 días directamente a tu puerta.</p><h3>2. La molienda correcta según tu método</h3><ul><li><strong>Prensa francesa:</strong> molido grueso, como sal de mar</li><li><strong>Pour over / V60:</strong> molido medio, como arena fina</li><li><strong>Espresso:</strong> molido fino, casi talco</li></ul><h3>3. Temperatura del agua: entre 90 y 96 °C</h3><p>Deja que el agua hierva y espera 30 segundos antes de verterla sobre los granos. El agua demasiado caliente quema los aceites esenciales del café.</p><h3>4. La proporción áurea</h3><p>Usa 1 gramo de café por cada 15-17 gramos de agua. Para una taza de 250 ml necesitas aproximadamente 15-16 gramos de café.</p><h2>Los errores más comunes</h2><p>El mayor error es comprar café premolido en el supermercado y guardarlo en el refrigerador. Ambas prácticas aceleran la oxidación y destruyen el sabor que tanto trabajo costó desarrollar al productor.</p><p>¡Suscríbete a Bolsa de Café y recibe cada mes granos de las mejores fincas de México, tostados especialmente para ti!</p>', NULL, 1, 3, 'archived', '2026-03-24 20:19:30', 0, 'Guía para preparar café de especialidad en casa - Bolsa de Café', 'Aprende a preparar un café de especialidad en casa con los mejores granos mexicanos. Temperatura, molienda y proporción perfecta.', '2026-03-25 02:19:30', '2026-05-08 04:18:15'),
(3, 'Oaxaca: La Cuna del Café Orgánico Mexicano', 'oaxaca-cuna-del-cafe-organico-mexicano', 'Descubre por qué la Sierra Norte de Oaxaca produce algunos de los cafés más complejos y premiados del país.', '<h2>Un terror único en el mundo</h2><p>La Sierra Norte de Oaxaca combina tres factores que los productores de café en todo el mundo buscan desesperadamente: altitud entre 1,200 y 1,800 metros sobre el nivel del mar, temperatura promedio de 18 °C y una biodiversidad de hongos y bacterias en el suelo que imparte sabores imposibles de replicar artificialmente.</p><h2>Los pueblos zapotecos y el café</h2><p>Las comunidades indígenas zapotecas llevan cultivando café en esta región desde el siglo XIX. Su relación con la milpa —el sistema agrícola tradicional que combina maíz, frijol y calabaza— les ha enseñado que la diversidad es fortaleza. Por eso sus cafetales crecen bajo la sombra de árboles de aguacate, naranja y guanábana, creando un ecosistema que no necesita pesticidas.</p><h2>El proceso de beneficio húmedo</h2><p>La mayoría de los productores de Oaxaca utilizan el proceso <em>lavado</em>: las cerezas de café se despulpan, fermentan en agua durante 12-36 horas y luego se secan en camas africanas elevadas. Este proceso limpia los azúcares residuales del grano y resulta en una taza limpia, brillante y con acidez cítrica característica.</p><h2>Notas de cata que puedes esperar</h2><p>Un buen café oaxaqueño te ofrecerá notas de <strong>chocolate negro</strong>, <strong>naranja</strong>, <strong>flor de hibisco</strong> y una acidez malic que recuerda a la manzana verde. La taza es sedosa, con un cuerpo medio y un retrogusto prolongado.</p><p>En nuestra selección mensual incluimos frecuentemente cafés de Oaxaca certificados orgánicos. <a href=\"/\">Suscríbete hoy</a> y descubrelos en tu próxima bolsa.</p>', NULL, 1, 2, 'archived', '2026-03-17 20:19:30', 0, 'Oaxaca y el café orgánico mexicano - Bolsa de Café', 'La Sierra Norte de Oaxaca produce los cafés orgánicos más premiados de México. Conoce su historia, proceso y perfil de taza.', '2026-03-18 02:19:30', '2026-05-08 04:18:20'),
(4, 'Cold Brew en Casa: La Receta que Cambia Todo', 'cold-brew-en-casa-receta-perfecta', 'El cold brew que compras en la cafetería cuesta 5 veces más de lo que te cuesta hacerlo en casa. Aquí te enseñamos cómo.', '<h2>¿Qué es el cold brew y por qué es diferente al café helado?</h2><p>El café helado (<em>iced coffee</em>) es simplemente café caliente vertido sobre hielos. El cold brew, en cambio, se prepara extrayendo el café en agua fría durante un periodo largo de 12 a 24 horas. El resultado es una bebida con un 67% menos de acidez, más dulce de forma natural y con una concentración de cafeína superior.</p><h2>Lo que necesitas</h2><ul><li>60 gramos de café molido grueso (el doble de lo normal)</li><li>750 ml de agua filtrada fría o a temperatura ambiente</li><li>Un frasco de vidrio con tapa</li><li>Un colador de tela o filtro de papel</li></ul><h2>El proceso paso a paso</h2><ol><li><strong>Muele grueso:</strong> como para prensa francesa. Una molienda fina hace el cold brew amargo.</li><li><strong>Mezcla:</strong> combina el café y el agua en tu frasco. Revuelve bien para asegurarte de que todos los granos estén húmedos.</li><li><strong>Refrigera:</strong> tapa el frasco y déjalo en el refrigerador entre 12 y 18 horas. A más tiempo, más intensidad.</li><li><strong>Filtra:</strong> pasa la mezcla por el colador dos veces para eliminar los sedimentos.</li><li><strong>Disfruta:</strong> el concentrado dura hasta 2 semanas en el refrigerador.</li></ol><h2>Cómo servirlo</h2><p>Sirve el concentrado diluido 1:1 con agua o leche sobre hielo. Agrega un toque de jarabe de vainilla o leche de avena para una experiencia de café de especialidad en casa.</p>', NULL, 2, 3, 'archived', NULL, 0, NULL, NULL, '2026-03-30 02:19:30', '2026-03-30 02:38:40'),
(5, 'Los Mejores Estados Productores de Café en México: Origen, Sabor y Tradición en Cada Taza', 'los-mejores-estados-productores-de-cafe-en-mexico-origen-sabor-y-tradicion-en-cada-taza', 'Descubre los mejores estados productores de café en México y explora los perfiles de sabor únicos de Chiapas, Oaxaca, Veracruz, Puebla y más. Conoce qué hace especial al café mexicano de especialidad, sus métodos de preparación y cómo cada región transforma la experiencia en taza.', '<h1 style=\"text-align: center;\"><strong>Los Mejores Estados Productores de Café en México: Origen, Sabor y Tradición en Cada Taza</strong></h1><p style=\"text-align: center;\"></p><hr><p></p><blockquote><h3 style=\"text-align: left;\">México no solo produce café: cuenta historias a través de cada grano. </h3></blockquote><h3 style=\"text-align: left;\">Desde las montañas de Chiapas hasta las neblinas de Veracruz y los paisajes de Oaxaca, el café mexicano se ha convertido en uno de los grandes tesoros gastronómicos del país.</h3><p></p><h3 style=\"text-align: left;\">Lo más fascinante es que cada región cafetalera tiene su propia personalidad. La altitud, el clima, el tipo de suelo y el proceso de cultivo crean perfiles completamente distintos: algunos cafés son dulces y achocolatados, mientras otros destacan por sus notas cítricas, florales o afrutadas.</h3><p></p><h3 style=\"text-align: left;\">En Bolsa de Café creemos que descubrir café mexicano es también descubrir México. Por eso, cada mes buscamos cafés de diferentes regiones para que puedas vivir una experiencia nueva en cada taza.</h3><p style=\"text-align: left;\"></p><p><strong>¿Por Qué el Café Mexicano es Tan Especial?</strong></p><p></p><p>México es uno de los principales productores de café a nivel mundial y uno de los pocos países con condiciones ideales para cultivar café arábica de alta calidad.</p><p>La mayoría del café mexicano se cultiva en zonas montañosas con:</p><p></p><p>-Altitudes superiores a 1,000 msnm</p><ul><li><p>-Climas húmedos y templados</p></li><li><p>-Suelos volcánicos ricos en minerales</p></li><li><p>-Producción artesanal en pequeñas fincas</p></li><li><p></p></li></ul><h3>Además, gran parte del café en México es cultivado por pequeños productores que mantienen métodos tradicionales y procesos cuidadosamente seleccionados.</h3><p></p><h3>El resultado: cafés complejos, balanceados y con perfiles únicos.</h3><p></p><p><strong>Chiapas: El Gigante del Café Mexicano</strong></p><p></p><p>Cuando se habla de café en México, Chiapas suele ser el primer nombre que aparece.</p><p>Este estado produce una gran parte del café nacional gracias a sus condiciones naturales privilegiadas, especialmente en regiones como: Soconusco, Altos de Chiapas y Sierra Madre</p><p></p><h3><strong>Perfil de sabor del café de Chiapas</strong></h3><p></p><p>El café chiapaneco suele destacar por: Notas de chocolate, Caramelo, Nueces, Cítricos suaves y Cuerpo medio a alto.</p><p></p><p>Es un café extremadamente balanceado y fácil de disfrutar, ideal tanto para quienes comienzan en el mundo del café de especialidad como para quienes buscan una taza consistente y elegante.</p><p></p><h3><strong>Métodos recomendados</strong></h3><h3>Los cafés de Chiapas suelen funcionar muy bien en: Prensa francesa, V60, Cafetera convencional, Espresso.</h3><h3></h3><h3>En espresso, muchas veces desarrollan una crema intensa y sabores dulces muy agradables.</h3><p></p><h2><strong>Oaxaca: Complejidad y Tradición Cafetalera</strong></h2><p>Oaxaca no solo es famoso por su gastronomía y cultura; también es hogar de algunos de los cafés más complejos y aromáticos de México.</p><p>Regiones como: Pluma Hidalgo, Sierra Sur y Pochutla</p><p>han ganado reconocimiento internacional por la calidad de sus granos.</p><p></p><h3><strong>¿Qué hace especial al café oaxaqueño?</strong></h3><h3>Muchos cafés de Oaxaca presentan: Notas florales, Chocolate oscuro, Piloncillo, Avellana,</h3><ul><li><p>Frutas cítricas, Caramelo.</p></li><li><p></p></li></ul><h3>Además, la variedad “Pluma” se ha convertido en una de las más reconocidas del país por su perfil elegante y aromático.</h3><h3></h3><h3>En métodos filtrados como Chemex o V60, los cafés de Oaxaca suelen resaltar muchísimo sus notas dulces y afrutadas.</h3><p></p><p><strong>Veracruz: Historia Cafetalera de México</strong></p><h3>Hablar de café mexicano también es hablar de Veracruz.</h3><h3>Durante décadas, este estado ha sido una referencia histórica para la producción de café gracias a regiones como: Coatepec, Huatusco, Córdoba.</h3><h3></h3><h3>La combinación entre altitud, humedad y suelos volcánicos produce cafés muy aromáticos y suaves.</h3><h3></h3><h3><strong>Perfil de taza del café veracruzano</strong></h3><h3>Los cafés de Veracruz suelen ofrecer: Acidez brillante, Notas frutales, Chocolate, Azúcar morena y Almendra.</h3><h3></h3><h3>Son cafés muy versátiles y accesibles, perfectos para el consumo diario.</h3><h3></h3><h3><strong>Ideal para métodos suaves</strong></h3><h3>Si disfrutas una taza limpia y aromática, los cafés veracruzanos funcionan excelente en:</h3><ul><li><p>Chemex, Kalita, Pour over, Cold brew</p></li><li><p></p></li></ul><h3>Especialmente en cold brew, algunos perfiles desarrollan sabores naturalmente dulces y refrescantes.</h3><h3></h3><p><strong>Puebla: Cafés Dulces y Balanceados</strong></p><h3>Aunque menos mencionado que otros estados, Puebla produce cafés de excelente calidad, especialmente en: Sierra Norte, Cuetzalan, Zacapoaxtla</h3><h3></h3><h3>Gracias a sus microclimas y producción artesanal, muchos cafés poblanos destacan por su dulzura natural.</h3><h3></h3><h3><strong>Perfil de sabor</strong></h3><h3>En taza suelen encontrarse: Cacao, Frutos secos, Miel, Cítricos suaves</h3><h3></h3><h3>Son cafés muy balanceados y fáciles de tomar todos los días.</h3><p></p><p></p><p><strong>Guerrero: Una Joya Poco Conocida</strong></p><h3>Guerrero es uno de esos secretos que poco a poco empieza a llamar la atención en el café de especialidad.</h3><h3></h3><h3>Aunque su producción es menor comparada con otros estados, algunas fincas están desarrollando cafés con perfiles muy interesantes y procesos experimentales.</h3><h3></h3><h3><strong>¿Cómo saben los cafés de Guerrero?</strong></h3><h3>Dependiendo del proceso, pueden encontrarse: Notas tropicales, Fruta madura, Chocolate, Caramelo y Acidez brillante.</h3><h3></h3><h3>Muchos tostadores de especialidad están comenzando a explorar esta región por su potencial.</h3><p></p><h2><strong>El Café Cambia Según el Proceso</strong></h2><p></p><p>Algo fascinante del café mexicano es que el sabor no depende únicamente del estado productor.</p><p></p><p>El proceso también transforma completamente la experiencia en taza.</p><p></p><h3><strong>Café lavado</strong></h3><p>Produce perfiles más limpios y brillantes, resaltando acidez y claridad.</p><p></p><h3><strong>Café honey</strong></h3><p>Tiende a desarrollar mayor dulzura y cuerpo.</p><p></p><h3><strong>Café natural</strong></h3><p>Suele ofrecer sabores más afrutados e intensos.</p><p></p><p>Por eso, dos cafés del mismo estado pueden saber completamente distintos.</p><p></p><p><strong>Cómo Descubrir Tu Región Favorita</strong></p><h3>La mejor manera de conocer el café mexicano es probar diferentes orígenes.</h3><h3>Tal vez descubras que prefieres: Los perfiles achocolatados de Chiapas, Las notas complejas de Oaxaca, La suavidad aromática de Veracruz, La dulzura balanceada de Puebla.</h3><h3></h3><h3>El café de especialidad se trata precisamente de eso: explorar, comparar y disfrutar cada taza.</h3><p></p><p><strong>Descubre México a Través del Café</strong></p><p>Cada bolsa de café guarda el trabajo de productores, familias y regiones enteras dedicadas al cultivo de granos extraordinarios.</p><p></p><p>En <a target=\"_new\" rel=\"noopener\" class=\"decorated-link\" href=\"https://bolsadecafe.com?utm_source=chatgpt.com\"><strong>Bolsa de Café</strong></a> seleccionamos cafés mexicanos de diferentes estados para que cada mes recibas una experiencia distinta, fresca y cuidadosamente elegida.</p><p></p><p>Desde perfiles chocolatosos hasta cafés frutales y complejos, nuestra suscripción está diseñada para quienes quieren descubrir lo mejor del café mexicano desde casa.</p><p></p><p>Descubre nuevos sabores, regiones y tostadores cada mes con <strong>Bolsa de Café.</strong></p>', 'https://disruptinglabs.com/data/api/data/bolsadecafe/blog-5/main_image/69fd78a809e91_1778219176.png', 2, 2, 'published', '2026-05-08 05:11:00', 0, NULL, NULL, '2026-05-08 05:10:57', '2026-05-08 05:46:28');

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
-- Table structure for table `coffee_catalog`
--

CREATE TABLE `coffee_catalog` (
  `id` int(11) NOT NULL,
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
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by_admin_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coffee_catalog`
--

INSERT INTO `coffee_catalog` (`id`, `name`, `provider`, `origin`, `coffee_type`, `variety`, `process`, `roast_level`, `altitude_min`, `altitude_max`, `tasting_notes`, `description`, `image_url`, `is_active`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
(1, 'Las Montañas ', 'RAMCAFE', 'Puebla', NULL, NULL, NULL, 'medium', NULL, NULL, NULL, NULL, NULL, 1, 2, '2026-04-21 00:01:54', '2026-04-21 00:01:54');

-- --------------------------------------------------------

--
-- Table structure for table `contact_submissions`
--

CREATE TABLE `contact_submissions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','in_review','resolved','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
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
  `stripe_invoice_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Stripe Invoice ID — used for idempotent webhook processing',
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'MXN',
  `status` enum('pending','processing','shipped','delivered','cancelled','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `shipping_address_id` int(11) DEFAULT NULL,
  `billing_address_id` int(11) DEFAULT NULL,
  `grind_type_id` int(11) DEFAULT NULL,
  `tracking_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipment_provider` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estimated_delivery` date DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `coffee_catalog_id` int(11) DEFAULT NULL COMMENT 'FK to coffee_catalog — the specific coffee batch sent in this order',
  `shipping_label_cost` decimal(10,2) DEFAULT NULL COMMENT 'Cost of the shipping label paid to the carrier',
  `supply_cost` decimal(10,2) DEFAULT NULL COMMENT 'Cost of supplies/packaging for this order'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `subscription_id`, `order_number`, `stripe_payment_intent_id`, `stripe_invoice_id`, `total_amount`, `currency`, `status`, `shipping_address_id`, `billing_address_id`, `grind_type_id`, `tracking_number`, `shipment_provider`, `estimated_delivery`, `shipped_at`, `delivered_at`, `notes`, `created_at`, `updated_at`, `coffee_catalog_id`, `shipping_label_cost`, `supply_cost`) VALUES
(3, 15, 3, 'BDC-1777071880275-3', NULL, 'in_1TPsm004sI0kP0GKOQil5gWm', 199.00, 'MXN', 'processing', 2, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-24 23:04:40', '2026-04-24 23:04:40', NULL, NULL, NULL),
(4, 15, 4, 'BDC-1777072200274-4', NULL, 'in_1TPsrB04sI0kP0GK0DLzCmhP', 399.00, 'MXN', 'shipped', 3, NULL, 4, '123456678899012', 'Estafeta', '2026-04-30', '2026-04-24 23:33:18', NULL, NULL, '2026-04-24 23:10:00', '2026-04-25 05:33:18', 1, 10.00, 20.00);

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

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `plan_id`, `quantity`, `unit_price`, `subtotal`, `created_at`) VALUES
(3, 3, 1, 1, 199.00, 199.00, '2026-04-24 23:04:40'),
(4, 4, 3, 1, 399.00, 399.00, '2026-04-24 23:10:00');

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

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `user_id`, `order_id`, `subscription_id`, `stripe_payment_id`, `amount`, `currency`, `status`, `payment_method`, `failure_reason`, `refunded_at`, `created_at`, `updated_at`) VALUES
(3, 15, 3, 3, NULL, 199.00, 'MXN', 'succeeded', 'card', NULL, NULL, '2026-04-24 23:04:40', '2026-04-24 23:04:40'),
(4, 15, 4, 4, NULL, 399.00, 'MXN', 'succeeded', 'card', NULL, NULL, '2026-04-24 23:10:00', '2026-04-24 23:10:00');

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

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `plan_id`, `grind_type_id`, `shipping_address_id`, `stripe_subscription_id`, `status`, `current_period_start`, `current_period_end`, `cancel_at_period_end`, `cancelled_at`, `notes`, `created_at`, `updated_at`) VALUES
(3, 15, 1, 2, 2, 'sub_1TPsm004sI0kP0GKwJwuBDvH', 'active', '2026-04-24', '2026-05-24', 0, NULL, NULL, '2026-04-24 23:04:40', '2026-04-24 23:04:40'),
(4, 15, 3, 4, 3, 'sub_1TPsrA04sI0kP0GKN7Gn7XOh', 'active', '2026-04-24', '2026-05-24', 0, NULL, NULL, '2026-04-24 23:10:00', '2026-04-24 23:10:00');

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
(15, 'axgoomez@gmail.com', 'Felix Gomez', '+524741400363', NULL, 'cus_UOg7GgCIX9r6vp', 1, 1, '2026-04-24 23:03:35', '2026-04-24 23:03:57'),
(16, 'lesliegcardona@gmail.com', 'Leslie Gonzalez', '+523311527891', NULL, NULL, 1, 1, '2026-04-25 05:38:29', '2026-04-25 05:39:18');

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
(2, 15, 'axgoomez@gmail.com', 243266, 0, '2026-04-24 17:18:35', NULL, NULL, '2026-04-24 23:03:35'),
(3, 16, 'lesliegcardona@gmail.com', 837840, 0, '2026-04-25 05:53:30', NULL, NULL, '2026-04-25 05:38:30');

-- --------------------------------------------------------

--
-- Table structure for table `visitor_events`
--

CREATE TABLE `visitor_events` (
  `id` bigint(20) NOT NULL,
  `session_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Client-generated UUID stored in sessionStorage',
  `user_id` int(11) DEFAULT NULL COMMENT 'FK to users.id — null for anonymous visitors',
  `event_type` enum('page_view','click','scroll','form_submit','subscription_start','subscription_complete','auth_open','auth_success','plan_select','checkout_start','checkout_complete','payment_method_added','payment_method_removed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'page_view',
  `page` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path + query string of the page (e.g. /subscription-wizard?step=2)',
  `referrer` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'HTTP Referer header or document.referrer',
  `utm_source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_medium` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_campaign` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_term` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_content` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IPv4 or IPv6 — populated server-side',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT 'Full UA string — populated server-side',
  `device_type` enum('desktop','mobile','tablet','unknown') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unknown',
  `browser` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Detected browser name (Chrome, Safari, Firefox…)',
  `os` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Detected OS (Windows, macOS, iOS, Android…)',
  `country_code` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ISO 3166-1 alpha-2 (populated via CF-IPCountry header)',
  `duration_ms` int(11) DEFAULT NULL COMMENT 'Time on page in ms — sent on navigation away',
  `metadata` json DEFAULT NULL COMMENT 'Arbitrary extra payload (selected plan id, step number, etc.)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Visitor analytics — page views and custom frontend events';

--
-- Dumping data for table `visitor_events`
--

INSERT INTO `visitor_events` (`id`, `session_id`, `user_id`, `event_type`, `page`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `ip_address`, `user_agent`, `device_type`, `browser`, `os`, `country_code`, `duration_ms`, `metadata`, `created_at`) VALUES
(1, '5554c8b2-6de8-4a16-957b-349081a7927c', NULL, 'page_view', '/', NULL, NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-17 05:36:09'),
(2, '5554c8b2-6de8-4a16-957b-349081a7927c', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-17 05:40:42'),
(3, '5554c8b2-6de8-4a16-957b-349081a7927c', NULL, 'page_view', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-17 05:40:51'),
(4, '5554c8b2-6de8-4a16-957b-349081a7927c', NULL, 'subscription_complete', '/subscription-wizard', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, '{\"plan_id\": \"500gr\"}', '2026-03-17 05:41:33'),
(5, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 02:55:49'),
(6, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 02:57:30'),
(8, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 02:58:00'),
(9, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 02:58:06'),
(10, 'anonymous', NULL, 'auth_success', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 02:58:46'),
(11, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'subscription_complete', '/subscription-wizard', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, '{\"plan_id\": \"500gr\"}', '2026-03-20 02:59:18'),
(12, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:00:03'),
(13, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:00:06'),
(14, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:02:45'),
(15, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:03:00'),
(16, 'anonymous', NULL, 'auth_success', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:03:45'),
(17, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'subscription_complete', '/subscription-wizard', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, '{\"plan_id\": \"500gr\"}', '2026-03-20 03:04:08'),
(20, 'anonymous', NULL, 'auth_success', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:09:30'),
(21, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'subscription_complete', '/subscription-wizard', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, '{\"plan_id\": \"500gr\"}', '2026-03-20 03:09:50'),
(22, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:10:28'),
(25, 'anonymous', NULL, 'auth_success', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:19:57'),
(26, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'subscription_complete', '/subscription-wizard', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, '{\"plan_id\": \"500gr\"}', '2026-03-20 03:20:33'),
(27, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:20:43'),
(28, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:33:12'),
(29, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:35:01'),
(30, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:37:40'),
(31, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:37:43'),
(32, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:37:59'),
(33, 'anonymous', NULL, 'auth_success', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:38:37'),
(34, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'subscription_complete', '/subscription-wizard', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, '{\"plan_id\": \"500gr\"}', '2026-03-20 03:38:57'),
(35, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:39:00'),
(36, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:43:44'),
(37, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:47:26'),
(38, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 03:47:32'),
(39, 'ff72770d-99d5-44eb-9f77-b64625d7466e', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 04:07:41'),
(40, '9c543c8a-b800-4aa7-b0a4-8e0c9c5a7dc3', NULL, 'page_view', '/', 'https://bolsadecafe-8q1crvcfo-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '24.199.115.54', 'vercel-screenshot/1.0', 'desktop', 'Other', 'Other', NULL, NULL, NULL, '2026-03-20 04:41:14'),
(41, '0e772c77-1d36-428d-84f8-121c5f74662a', NULL, 'page_view', '/', 'https://bolsadecafe-8q1crvcfo-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '3.101.120.254', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36', 'desktop', 'Chrome', 'Linux', NULL, NULL, NULL, '2026-03-20 04:41:14'),
(42, 'b11a4ca8-a13d-459b-8451-1e2a2ebd0374', NULL, 'page_view', '/', 'https://bolsadecafe-8q1crvcfo-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '13.57.232.180', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36', 'desktop', 'Chrome', 'Linux', NULL, NULL, NULL, '2026-03-20 04:41:14'),
(43, '5b498f95-2969-4183-a0d6-c4204e214078', NULL, 'page_view', '/', 'https://bolsadecafe-8q1crvcfo-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '143.198.152.117', 'vercel-screenshot/1.0', 'desktop', 'Other', 'Other', NULL, NULL, NULL, '2026-03-20 04:41:15'),
(44, '9ee08c01-4c63-484f-a62f-d14b4fe84370', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 17:34:40'),
(45, 'f30cddc3-42bc-4361-968a-214c0da01eab', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 18:12:58'),
(46, '1600de68-9602-4752-a6b4-0e0e900fc90f', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-20 18:13:04'),
(47, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-20 19:03:56'),
(48, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:07:00'),
(49, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:07:33'),
(50, 'anonymous', NULL, 'auth_success', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:08:52'),
(51, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:09:26'),
(52, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'subscription_complete', '/subscription-wizard', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, '{\"plan_id\": \"500gr\"}', '2026-03-23 02:11:24'),
(53, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:12:07'),
(54, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:13:15'),
(55, 'anonymous', NULL, 'auth_success', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:13:47'),
(56, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:14:38'),
(57, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:14:41'),
(58, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:14:46'),
(59, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:14:59'),
(60, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:16:10'),
(61, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:18:10'),
(62, '1dac234e-0c82-42e0-af2a-e63dca70d383', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-23 02:26:14'),
(63, 'ca173c78-74a2-4997-a922-c1b7dd90b9bc', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '204.194.118.136', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-28 00:27:47'),
(64, 'ca173c78-74a2-4997-a922-c1b7dd90b9bc', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '204.194.118.136', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-28 00:27:55'),
(65, '9d8ee367-3175-4e6e-b331-deb4fc330812', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-30 02:20:04'),
(66, 'd2d30c60-23b6-45b8-938b-d7907161b82a', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-30 02:24:52'),
(67, 'd2d30c60-23b6-45b8-938b-d7907161b82a', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-30 02:26:36'),
(68, 'd2d30c60-23b6-45b8-938b-d7907161b82a', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-30 02:27:12'),
(69, 'd2d30c60-23b6-45b8-938b-d7907161b82a', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-30 02:30:14'),
(70, 'd2d30c60-23b6-45b8-938b-d7907161b82a', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-03-30 02:55:52'),
(71, '97d735fc-6cd9-4289-9f3f-3b6b691abc3b', NULL, 'page_view', '/', 'https://bolsadecafe-2watbwakb-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '64.23.232.81', 'vercel-screenshot/1.0', 'desktop', 'Other', 'Other', NULL, NULL, NULL, '2026-03-30 03:06:43'),
(72, 'd79c6aaf-e2a4-46f0-a5fc-200145047a43', NULL, 'page_view', '/', 'https://bolsadecafe-2watbwakb-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '137.184.42.34', 'vercel-screenshot/1.0', 'desktop', 'Other', 'Other', NULL, NULL, NULL, '2026-03-30 03:06:43'),
(73, 'c1256196-dac7-40ce-9316-0eb42a6935d6', NULL, 'page_view', '/', 'https://bolsadecafe-2watbwakb-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '54.151.51.112', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36', 'desktop', 'Chrome', 'Linux', NULL, NULL, NULL, '2026-03-30 03:06:44'),
(74, '7f851c01-a59d-446b-adf5-47e6131309a4', NULL, 'page_view', '/', 'https://bolsadecafe-2watbwakb-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '54.219.118.86', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36', 'desktop', 'Chrome', 'Linux', NULL, NULL, NULL, '2026-03-30 03:06:44'),
(75, '1a53df82-cf1f-4425-902b-9d1f85778cd4', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-30 03:08:46'),
(76, '0ec8792f-e96c-4b44-8f44-b57d8857db22', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-30 03:11:47'),
(77, '78afd8e3-c478-4351-ad07-3909c660ea69', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-30 03:12:16'),
(78, '78afd8e3-c478-4351-ad07-3909c660ea69', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-30 03:12:36'),
(79, '78afd8e3-c478-4351-ad07-3909c660ea69', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-03-30 03:13:20'),
(80, '622f0f9c-fcbd-4001-bee4-6ae859063763', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-11 01:24:08'),
(81, '45123041-465d-45ea-967e-18ded91746c9', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-11 01:41:35'),
(82, '9d76623f-de91-4789-ad6b-3142cd264379', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-12 03:10:50'),
(83, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:11:29'),
(84, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:14:07'),
(85, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:14:49'),
(86, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:15:00'),
(87, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:15:20'),
(88, 'anonymous', NULL, 'auth_success', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:16:36'),
(89, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:18:17'),
(90, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:21:36'),
(91, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:23:45'),
(92, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:26:45'),
(93, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:26:51'),
(94, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-12 03:28:34'),
(95, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-13 03:24:03'),
(96, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-13 03:24:39'),
(97, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-13 03:24:45'),
(98, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-13 03:24:52'),
(99, '7595a6f1-e8fe-4512-9ffc-8f8c1120e448', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-13 03:24:55'),
(100, '2d18483c-6718-46e1-b8a6-4053530d17d8', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:06:54'),
(101, '2d18483c-6718-46e1-b8a6-4053530d17d8', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:11:26'),
(102, '2d18483c-6718-46e1-b8a6-4053530d17d8', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:11:28'),
(103, 'dbd82973-47ea-47a8-9466-b49f719527d0', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:18:50'),
(104, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:19:32'),
(105, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:19:34'),
(106, '5f123c25-feee-44c8-bc28-b3a17941b06d', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-14 19:21:22'),
(107, '5f123c25-feee-44c8-bc28-b3a17941b06d', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-14 19:21:30'),
(108, 'anonymous', NULL, 'auth_success', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-14 19:22:15'),
(109, '5f123c25-feee-44c8-bc28-b3a17941b06d', NULL, 'subscription_complete', '/subscription-wizard', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, '{\"plan_id\": \"500gr\"}', '2026-04-14 19:23:06'),
(110, '5f123c25-feee-44c8-bc28-b3a17941b06d', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-14 19:23:29'),
(111, '5f123c25-feee-44c8-bc28-b3a17941b06d', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-14 19:23:40'),
(112, 'anonymous', NULL, 'auth_success', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-14 19:24:23'),
(113, 'anonymous', NULL, 'auth_success', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:25:48'),
(114, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:34:20'),
(115, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'subscription_complete', '/subscription-wizard', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, '{\"plan_id\": \"500gr\"}', '2026-04-14 19:35:08'),
(116, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:35:23'),
(117, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:35:30'),
(118, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:35:31'),
(119, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:35:42'),
(120, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:35:43'),
(121, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:37:12'),
(122, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:37:14'),
(123, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:37:25'),
(124, 'eee4f05f-37c2-42ba-90ec-f2a83ae5eade', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:37:48'),
(125, '4b1f8d5f-2d9f-4203-95f3-5d641fe94373', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:44:50'),
(126, '4b1f8d5f-2d9f-4203-95f3-5d641fe94373', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:45:45'),
(127, '4b1f8d5f-2d9f-4203-95f3-5d641fe94373', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:45:49'),
(128, '4b1f8d5f-2d9f-4203-95f3-5d641fe94373', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 19:45:52'),
(129, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 21:54:24'),
(130, 'anonymous', NULL, 'auth_success', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 21:57:19'),
(131, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 21:57:22'),
(132, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 21:57:23'),
(133, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 22:00:11'),
(134, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'subscription_complete', '/subscription-wizard', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, '{\"plan_id\": \"1kg\"}', '2026-04-14 22:00:58'),
(135, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 22:01:03'),
(136, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 22:01:37'),
(137, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 22:01:47'),
(138, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 22:01:51'),
(139, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 22:01:57'),
(140, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 22:02:13'),
(141, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 22:02:18'),
(142, 'b90f1aa3-eec8-48e1-ad31-e13dcc3baf4a', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-14 22:02:22'),
(143, '6f345106-1651-4c30-b1ee-68bc855ae203', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-16 03:56:34'),
(144, 'd0ca5824-7e1a-4709-bb86-cba2fada46ff', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-19 19:30:10'),
(145, 'anonymous', NULL, 'auth_success', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-19 19:31:47'),
(146, 'd0ca5824-7e1a-4709-bb86-cba2fada46ff', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-19 19:32:01'),
(147, 'd0ca5824-7e1a-4709-bb86-cba2fada46ff', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-19 19:32:04'),
(148, 'd0ca5824-7e1a-4709-bb86-cba2fada46ff', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-19 19:32:12');
INSERT INTO `visitor_events` (`id`, `session_id`, `user_id`, `event_type`, `page`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `ip_address`, `user_agent`, `device_type`, `browser`, `os`, `country_code`, `duration_ms`, `metadata`, `created_at`) VALUES
(149, 'd0ca5824-7e1a-4709-bb86-cba2fada46ff', NULL, 'subscription_complete', '/subscription-wizard', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, '{\"plan_id\": \"1kg\"}', '2026-04-19 19:35:53'),
(150, 'd0ca5824-7e1a-4709-bb86-cba2fada46ff', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-19 19:39:42'),
(151, 'd0ca5824-7e1a-4709-bb86-cba2fada46ff', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-19 19:40:36'),
(152, 'd0ca5824-7e1a-4709-bb86-cba2fada46ff', NULL, 'subscription_complete', '/subscription-wizard', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, '{\"plan_id\": \"500gr\"}', '2026-04-19 19:43:24'),
(153, 'd0ca5824-7e1a-4709-bb86-cba2fada46ff', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '177.239.245.226', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15', 'desktop', 'Safari', 'macOS', NULL, NULL, NULL, '2026-04-19 19:43:32'),
(154, 'df3c92cb-d878-4657-8ab5-ee7357718a1c', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-20 23:58:36'),
(155, '5e470e50-3461-4301-bc05-5185cd39fc09', NULL, 'page_view', '/', 'https://bolsadecafe-6elw3qeio-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '54.219.121.207', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36', 'desktop', 'Chrome', 'Linux', NULL, NULL, NULL, '2026-04-22 18:03:06'),
(156, '49d490ab-f858-4a4c-977d-c786dba3ada9', NULL, 'page_view', '/', 'https://bolsadecafe-6elw3qeio-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '18.144.31.27', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36', 'desktop', 'Chrome', 'Linux', NULL, NULL, NULL, '2026-04-22 18:03:06'),
(157, '8c301215-866d-4012-b326-13922e671321', NULL, 'page_view', '/', 'https://bolsadecafe-bqshxddpy-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '13.56.114.183', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36', 'desktop', 'Chrome', 'Linux', NULL, NULL, NULL, '2026-04-22 18:05:48'),
(158, '8ccdd307-14b1-4ca1-82de-1c511c927b28', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-22 18:05:49'),
(159, '03b6a945-c034-4201-94fc-e4c83ac0d46c', NULL, 'page_view', '/', 'https://bolsadecafe-bqshxddpy-alex-gomezs-projects-d5136c4b.vercel.app/', NULL, NULL, NULL, NULL, NULL, '18.145.40.105', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36', 'desktop', 'Chrome', 'Linux', NULL, NULL, NULL, '2026-04-22 18:05:49'),
(160, '8ccdd307-14b1-4ca1-82de-1c511c927b28', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-22 18:05:56'),
(161, 'anonymous', NULL, 'auth_success', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-22 18:06:53'),
(162, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 22:50:45'),
(163, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', NULL, 'page_view', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 22:51:06'),
(164, 'anonymous', NULL, 'auth_success', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 22:51:42'),
(165, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', NULL, 'subscription_complete', '/subscription-wizard', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, '{\"plan_id\": \"500gr\"}', '2026-04-24 22:52:15'),
(166, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 22:52:21'),
(167, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', NULL, 'page_view', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 22:52:55'),
(168, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', NULL, 'subscription_complete', '/subscription-wizard', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, '{\"plan_id\": \"1kg\"}', '2026-04-24 22:53:37'),
(169, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 22:53:40'),
(170, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 22:57:31'),
(171, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 23:00:54'),
(172, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', NULL, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 23:03:11'),
(173, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', NULL, 'page_view', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 23:03:15'),
(174, 'anonymous', NULL, 'auth_success', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 23:03:49'),
(175, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', 15, 'subscription_complete', '/subscription-wizard', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, '{\"plan_id\": \"250gr\"}', '2026-04-24 23:04:41'),
(176, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', 15, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 23:04:49'),
(177, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', 15, 'page_view', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 23:04:55'),
(178, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', 15, 'page_view', '/', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 23:08:46'),
(179, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', 15, 'subscription_complete', '/subscription-wizard', 'http://localhost:8080/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, '{\"plan_id\": \"1kg\"}', '2026-04-24 23:10:01'),
(180, '3af5ca84-1528-41cf-aeeb-d1011b1aed70', 15, 'page_view', '/', 'http://localhost:8080/', NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'macOS', NULL, NULL, NULL, '2026-04-24 23:10:04'),
(181, '6fd50930-92e2-4dd4-875b-a7feb0bdd576', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-25 04:23:26'),
(182, '6fd50930-92e2-4dd4-875b-a7feb0bdd576', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-25 05:35:54'),
(183, '6fd50930-92e2-4dd4-875b-a7feb0bdd576', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/subscription-wizard', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-25 05:36:06'),
(184, '6fd50930-92e2-4dd4-875b-a7feb0bdd576', NULL, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-25 05:36:17'),
(185, 'anonymous', NULL, 'auth_success', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-04-25 05:39:18'),
(186, 'e48d47d8-f4bb-492e-87ac-a13ae2d395cb', 16, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-05-02 02:57:13'),
(187, 'e48d47d8-f4bb-492e-87ac-a13ae2d395cb', 16, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-05-02 03:45:13'),
(190, '3facd9d0-6435-4595-9bad-1fb8bc6f0a93', 16, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-05-08 04:16:52'),
(191, 'c0639ac5-c092-4af1-ab0f-930b3d710f5f', 16, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-05-08 04:18:26'),
(192, 'f1f859fe-cf7d-49e2-a55f-20427240b910', 16, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-05-08 05:11:31'),
(193, '9d90d84d-a2a6-4c11-89d4-4d4031ff5119', 16, 'page_view', '/', 'https://bolsadecafe-ui.vercel.app/', NULL, NULL, NULL, NULL, NULL, '187.189.149.139', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'desktop', 'Chrome', 'Windows', NULL, NULL, NULL, '2026-05-08 05:46:39');

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
  ADD KEY `idx_blog_posts_status_published` (`status`,`published_at`),
  ADD KEY `idx_blog_posts_status` (`status`),
  ADD KEY `idx_blog_posts_slug` (`slug`),
  ADD KEY `idx_blog_posts_author` (`author_id`);
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
-- Indexes for table `coffee_catalog`
--
ALTER TABLE `coffee_catalog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_coffee_catalog_is_active` (`is_active`),
  ADD KEY `idx_coffee_catalog_provider` (`provider`),
  ADD KEY `fk_coffee_catalog_admin` (`created_by_admin_id`);

--
-- Indexes for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_topic` (`topic`),
  ADD KEY `idx_status` (`status`);

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
  ADD UNIQUE KEY `uq_orders_stripe_invoice_id` (`stripe_invoice_id`),
  ADD KEY `subscription_id` (`subscription_id`),
  ADD KEY `shipping_address_id` (`shipping_address_id`),
  ADD KEY `billing_address_id` (`billing_address_id`),
  ADD KEY `grind_type_id` (`grind_type_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_orders_user_status` (`user_id`,`status`),
  ADD KEY `fk_order_coffee_catalog` (`coffee_catalog_id`);

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
-- Indexes for table `visitor_events`
--
ALTER TABLE `visitor_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ve_session` (`session_id`),
  ADD KEY `idx_ve_user` (`user_id`),
  ADD KEY `idx_ve_event_type` (`event_type`),
  ADD KEY `idx_ve_created` (`created_at`),
  ADD KEY `idx_ve_page` (`page`(191));

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `admin_logs`
--
ALTER TABLE `admin_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
-- AUTO_INCREMENT for table `coffee_catalog`
--
ALTER TABLE `coffee_catalog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `plan_features`
--
ALTER TABLE `plan_features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `visitor_events`
--
ALTER TABLE `visitor_events`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

--
-- AUTO_INCREMENT for table `webhook_events`
--
ALTER TABLE `webhook_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `coffee_catalog`
--
ALTER TABLE `coffee_catalog`
  ADD CONSTRAINT `fk_coffee_catalog_admin` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_coffee_catalog` FOREIGN KEY (`coffee_catalog_id`) REFERENCES `coffee_catalog` (`id`) ON DELETE SET NULL,
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

--
-- Constraints for table `visitor_events`
--
ALTER TABLE `visitor_events`
  ADD CONSTRAINT `fk_ve_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
