-- Migration: Add Business Subscription Plan
-- Date: 2026-01-24
-- Description: Adds a business subscription plan that requires contact form instead of wizard flow

-- Add business subscription plan (skip if already exists)
INSERT IGNORE INTO subscription_plans (
    plan_id, 
    name, 
    description, 
    weight, 
    price_mxn, 
    is_active
) VALUES (
    'business',
    'Suscripción Personalizada para Tu Negocio',
    'Solución personalizada de café para tu oficina o negocio. Incluye consultoría, descuentos por volumen, facturación flexible y café adaptado a tus necesidades específicas.',
    'personalizado',
    0.00, -- Price is custom, set to 0 for contact-only
    TRUE
);

-- Optional: Add a flag column to identify contact-only plans
-- This helps differentiate between regular subscription plans and contact-based plans
ALTER TABLE subscription_plans 
ADD COLUMN requires_contact BOOLEAN DEFAULT FALSE AFTER is_active;

-- Update the business plan to require contact
UPDATE subscription_plans 
SET requires_contact = TRUE 
WHERE plan_id = 'business';

-- Optional: Create a business_inquiries table to store contact form submissions
CREATE TABLE IF NOT EXISTS business_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    monthly_consumption VARCHAR(100),
    employees_count VARCHAR(50),
    current_supplier VARCHAR(255),
    message TEXT,
    status ENUM('new', 'contacted', 'quoted', 'converted', 'declined') DEFAULT 'new',
    notes TEXT,
    assigned_to_admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to explain the business plan
ALTER TABLE subscription_plans 
MODIFY COLUMN description TEXT COMMENT 'For business plan, this is shown in the modal header';
