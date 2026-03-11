-- Migration: Add Plan Features Table
-- Date: 2026-01-24
-- Description: Create table to store subscription plan features/benefits

-- Create plan_features table
CREATE TABLE IF NOT EXISTS plan_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    feature_text VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
    INDEX idx_plan_id (plan_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert features for 250gr plan
INSERT INTO plan_features (plan_id, feature_text, sort_order) VALUES
(1, 'Café 100% mexicano premium', 1),
(1, 'Perfecto para 1-2 personas', 2),
(1, 'Envío gratis en toda la República', 3),
(1, 'Cancela cuando quieras', 4),
(1, 'Grano entero o molido a tu preferencia', 5),
(1, 'Guía de preparación incluida', 6);

-- Insert features for 500gr plan
INSERT INTO plan_features (plan_id, feature_text, sort_order) VALUES
(2, 'Café 100% mexicano premium', 1),
(2, 'Ideal para 2-4 personas', 2),
(2, 'Envío gratis en toda la República', 3),
(2, 'Cancela cuando quieras', 4),
(2, 'Grano entero o molido a tu preferencia', 5),
(2, 'Notas de cata exclusivas', 6),
(2, 'Acceso a café de temporada', 7);

-- Insert features for 1kg plan
INSERT INTO plan_features (plan_id, feature_text, sort_order) VALUES
(3, 'Café 100% mexicano premium', 1),
(3, 'Perfecto para familias o oficinas (5+ personas)', 2),
(3, 'Envío gratis en toda la República', 3),
(3, 'Cancela cuando quieras', 4),
(3, 'Grano entero o molido a tu preferencia', 5),
(3, 'Mix de variedades cada mes', 6),
(3, 'Descuento en compras adicionales', 7),
(3, 'Acceso prioritario a cafés exclusivos', 8);
