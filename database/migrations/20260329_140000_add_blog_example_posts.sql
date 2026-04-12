-- Migration: 20260329_140000_add_blog_example_posts.sql
-- Adds 3 example blog posts (2 published + 1 draft) and missing indices
-- Compatible with MySQL 5.7 (HostGator, alanchat_bolsadecafe)

-- Ensure indices exist on commonly queried columns (MySQL 5.7 compatible)
SET @exists_status = (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'blog_posts' AND index_name = 'idx_blog_posts_status');
SET @sql_status = IF(@exists_status = 0, 'ALTER TABLE `blog_posts` ADD INDEX `idx_blog_posts_status` (`status`)', 'SELECT 1');
PREPARE stmt FROM @sql_status; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists_slug = (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'blog_posts' AND index_name = 'idx_blog_posts_slug');
SET @sql_slug = IF(@exists_slug = 0, 'ALTER TABLE `blog_posts` ADD INDEX `idx_blog_posts_slug` (`slug`)', 'SELECT 1');
PREPARE stmt FROM @sql_slug; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists_author = (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'blog_posts' AND index_name = 'idx_blog_posts_author');
SET @sql_author = IF(@exists_author = 0, 'ALTER TABLE `blog_posts` ADD INDEX `idx_blog_posts_author` (`author_id`)', 'SELECT 1');
PREPARE stmt FROM @sql_author; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Example post 1: Published — Brewing guide
INSERT INTO `blog_posts`
  (`title`, `slug`, `excerpt`, `content`, `featured_image`, `author_id`, `category_id`, `status`, `published_at`, `views`, `meta_title`, `meta_description`, `created_at`, `updated_at`)
VALUES (
  'La Guía Definitiva para Preparar Café de Especialidad en Casa',
  'guia-definitiva-cafe-especialidad-en-casa',
  'Prepara una taza extraordinaria sin salir de tu hogar. Desde elegir los granos correctos hasta dominar la temperatura del agua.',
  '<h2>¿Qué es el café de especialidad?</h2><p>El café de especialidad es aquel que obtiene una puntuación igual o superior a 80 puntos en la escala de la Specialty Coffee Association (SCA). Estos granos provienen de regiones específicas, son cosechados a mano y procesados con cuidado excepcional.</p><h2>Los elementos clave para una taza perfecta</h2><h3>1. El grano fresco lo es todo</h3><p>Un café pierde hasta el 60% de sus compuestos aromáticos en los primeros 15 días después de ser tostado. En <strong>Bolsa de Café</strong> enviamos granos tostados en los últimos 7 días directamente a tu puerta.</p><h3>2. La molienda correcta según tu método</h3><ul><li><strong>Prensa francesa:</strong> molido grueso, como sal de mar</li><li><strong>Pour over / V60:</strong> molido medio, como arena fina</li><li><strong>Espresso:</strong> molido fino, casi talco</li></ul><h3>3. Temperatura del agua: entre 90 y 96 °C</h3><p>Deja que el agua hierva y espera 30 segundos antes de verterla sobre los granos. El agua demasiado caliente quema los aceites esenciales del café.</p><h3>4. La proporción áurea</h3><p>Usa 1 gramo de café por cada 15-17 gramos de agua. Para una taza de 250 ml necesitas aproximadamente 15-16 gramos de café.</p><h2>Los errores más comunes</h2><p>El mayor error es comprar café premolido en el supermercado y guardarlo en el refrigerador. Ambas prácticas aceleran la oxidación y destruyen el sabor que tanto trabajo costó desarrollar al productor.</p><p>¡Suscríbete a Bolsa de Café y recibe cada mes granos de las mejores fincas de México, tostados especialmente para ti!</p>',
  NULL,
  1,
  3,
  'published',
  DATE_SUB(NOW(), INTERVAL 5 DAY),
  0,
  'Guía para preparar café de especialidad en casa - Bolsa de Café',
  'Aprende a preparar un café de especialidad en casa con los mejores granos mexicanos. Temperatura, molienda y proporción perfecta.',
  DATE_SUB(NOW(), INTERVAL 5 DAY),
  DATE_SUB(NOW(), INTERVAL 5 DAY)
);

-- Example post 2: Published — Coffee origin story
INSERT INTO `blog_posts`
  (`title`, `slug`, `excerpt`, `content`, `featured_image`, `author_id`, `category_id`, `status`, `published_at`, `views`, `meta_title`, `meta_description`, `created_at`, `updated_at`)
VALUES (
  'Oaxaca: La Cuna del Café Orgánico Mexicano',
  'oaxaca-cuna-del-cafe-organico-mexicano',
  'Descubre por qué la Sierra Norte de Oaxaca produce algunos de los cafés más complejos y premiados del país.',
  '<h2>Un terror único en el mundo</h2><p>La Sierra Norte de Oaxaca combina tres factores que los productores de café en todo el mundo buscan desesperadamente: altitud entre 1,200 y 1,800 metros sobre el nivel del mar, temperatura promedio de 18 °C y una biodiversidad de hongos y bacterias en el suelo que imparte sabores imposibles de replicar artificialmente.</p><h2>Los pueblos zapotecos y el café</h2><p>Las comunidades indígenas zapotecas llevan cultivando café en esta región desde el siglo XIX. Su relación con la milpa —el sistema agrícola tradicional que combina maíz, frijol y calabaza— les ha enseñado que la diversidad es fortaleza. Por eso sus cafetales crecen bajo la sombra de árboles de aguacate, naranja y guanábana, creando un ecosistema que no necesita pesticidas.</p><h2>El proceso de beneficio húmedo</h2><p>La mayoría de los productores de Oaxaca utilizan el proceso <em>lavado</em>: las cerezas de café se despulpan, fermentan en agua durante 12-36 horas y luego se secan en camas africanas elevadas. Este proceso limpia los azúcares residuales del grano y resulta en una taza limpia, brillante y con acidez cítrica característica.</p><h2>Notas de cata que puedes esperar</h2><p>Un buen café oaxaqueño te ofrecerá notas de <strong>chocolate negro</strong>, <strong>naranja</strong>, <strong>flor de hibisco</strong> y una acidez malic que recuerda a la manzana verde. La taza es sedosa, con un cuerpo medio y un retrogusto prolongado.</p><p>En nuestra selección mensual incluimos frecuentemente cafés de Oaxaca certificados orgánicos. <a href="/">Suscríbete hoy</a> y descubrelos en tu próxima bolsa.</p>',
  NULL,
  1,
  2,
  'published',
  DATE_SUB(NOW(), INTERVAL 12 DAY),
  0,
  'Oaxaca y el café orgánico mexicano - Bolsa de Café',
  'La Sierra Norte de Oaxaca produce los cafés orgánicos más premiados de México. Conoce su historia, proceso y perfil de taza.',
  DATE_SUB(NOW(), INTERVAL 12 DAY),
  DATE_SUB(NOW(), INTERVAL 12 DAY)
);

-- Example post 3: Draft — Cold brew guide
INSERT INTO `blog_posts`
  (`title`, `slug`, `excerpt`, `content`, `featured_image`, `author_id`, `category_id`, `status`, `published_at`, `views`, `meta_title`, `meta_description`, `created_at`, `updated_at`)
VALUES (
  'Cold Brew en Casa: La Receta que Cambia Todo',
  'cold-brew-en-casa-receta-perfecta',
  'El cold brew que compras en la cafetería cuesta 5 veces más de lo que te cuesta hacerlo en casa. Aquí te enseñamos cómo.',
  '<h2>¿Qué es el cold brew y por qué es diferente al café helado?</h2><p>El café helado (<em>iced coffee</em>) es simplemente café caliente vertido sobre hielos. El cold brew, en cambio, se prepara extrayendo el café en agua fría durante un periodo largo de 12 a 24 horas. El resultado es una bebida con un 67% menos de acidez, más dulce de forma natural y con una concentración de cafeína superior.</p><h2>Lo que necesitas</h2><ul><li>60 gramos de café molido grueso (el doble de lo normal)</li><li>750 ml de agua filtrada fría o a temperatura ambiente</li><li>Un frasco de vidrio con tapa</li><li>Un colador de tela o filtro de papel</li></ul><h2>El proceso paso a paso</h2><ol><li><strong>Muele grueso:</strong> como para prensa francesa. Una molienda fina hace el cold brew amargo.</li><li><strong>Mezcla:</strong> combina el café y el agua en tu frasco. Revuelve bien para asegurarte de que todos los granos estén húmedos.</li><li><strong>Refrigera:</strong> tapa el frasco y déjalo en el refrigerador entre 12 y 18 horas. A más tiempo, más intensidad.</li><li><strong>Filtra:</strong> pasa la mezcla por el colador dos veces para eliminar los sedimentos.</li><li><strong>Disfruta:</strong> el concentrado dura hasta 2 semanas en el refrigerador.</li></ol><h2>Cómo servirlo</h2><p>Sirve el concentrado diluido 1:1 con agua o leche sobre hielo. Agrega un toque de jarabe de vainilla o leche de avena para una experiencia de café de especialidad en casa.</p>',
  NULL,
  2,
  3,
  'draft',
  NULL,
  0,
  NULL,
  NULL,
  NOW(),
  NOW()
);
