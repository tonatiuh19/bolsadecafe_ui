# Database Schema Documentation

## Overview

This document provides a comprehensive guide to the Bolsa de Café database schema.

## Quick Reference

### Tables Summary

| Table Name             | Purpose                 | Key Features                                     |
| ---------------------- | ----------------------- | ------------------------------------------------ |
| **admins**             | Admin user accounts     | Separate from regular users, can be blog authors |
| **admin_logs**         | Admin activity tracking | Audit trail for security                         |
| **users**              | Customer accounts       | Email, Stripe integration                        |
| **mexico_states**      | Mexican states          | 32 states with official codes                    |
| **addresses**          | User addresses          | References mexico_states for validation          |
| **grind_types**        | Coffee grind options    | Dynamic, user-selectable during checkout         |
| **subscription_plans** | Plan definitions        | 250gr, 500gr, 1kg                                |
| **subscriptions**      | User subscriptions      | Includes grind_type_id preference                |
| **orders**             | Customer orders         | Full order lifecycle tracking                    |
| **order_items**        | Order line items        | Products in each order                           |
| **payments**           | Payment transactions    | Stripe payment tracking                          |
| **blog_categories**    | Blog post categories    | Organize blog content                            |
| **blog_posts**         | Blog articles           | Admin-authored content                           |
| **blog_tags**          | Post tags               | Flexible tagging system                          |
| **blog_post_tags**     | Post-tag relationships  | Many-to-many mapping                             |
| **blog_comments**      | User comments           | Moderation workflow                              |
| **webhook_events**     | Stripe webhook log      | Event tracking and replay                        |

## Key Relationships

### User Flow

```
users
  ├─→ addresses (many) → mexico_states
  ├─→ subscriptions (many) → subscription_plans, grind_types
  ├─→ orders (many) → order_items, addresses, grind_types
  └─→ payments (many)
```

### Blog Flow

```
admins (authors)
  └─→ blog_posts (many)
        ├─→ blog_categories
        ├─→ blog_post_tags → blog_tags
        └─→ blog_comments (many)
```

## Grind Types

The grind types are stored in the database and can be managed dynamically:

| Code         | Name              | Best For                         |
| ------------ | ----------------- | -------------------------------- |
| `whole_bean` | Grano Entero      | Maximum freshness, grind at home |
| `coarse`     | Molido Grueso     | French press, cold brew          |
| `medium`     | Molido Medio      | Drip coffee, pour over           |
| `fine`       | Molido Fino       | Espresso, moka pot               |
| `extra_fine` | Molido Extra Fino | Turkish coffee                   |

## Mexico States

All 32 Mexican states are included with official 3-letter codes:

```
AGU - Aguascalientes    |  NAY - Nayarit
BCN - Baja California   |  NLE - Nuevo León
BCS - Baja California S.|  OAX - Oaxaca
CAM - Campeche          |  PUE - Puebla
CHP - Chiapas           |  QUE - Querétaro
CHH - Chihuahua         |  ROO - Quintana Roo
COA - Coahuila          |  SLP - San Luis Potosí
COL - Colima            |  SIN - Sinaloa
CMX - Ciudad de México  |  SON - Sonora
DUR - Durango           |  TAB - Tabasco
GUA - Guanajuato        |  TAM - Tamaulipas
GRO - Guerrero          |  TLA - Tlaxcala
HID - Hidalgo           |  VER - Veracruz
JAL - Jalisco           |  YUC - Yucatán
MEX - Estado de México  |  ZAC - Zacatecas
MIC - Michoacán         |
MOR - Morelos           |
```

## Subscription Plans

| Plan ID | Name                | Weight      | Price (MXN) |
| ------- | ------------------- | ----------- | ----------- |
| 250gr   | Bolsa de Café 250gr | 250 gramos  | $199.00     |
| 500gr   | Bolsa de Café 500gr | 500 gramos  | $299.00     |
| 1kg     | Bolsa de Café 1kg   | 1 kilogramo | $399.00     |

## Blog Categories

Default categories included:

1. **Recetas de Café** (`recetas`) - Coffee recipes and preparations
2. **Cultura del Café** (`cultura`) - History, origin, and coffee culture
3. **Guías y Tips** (`guias`) - Brewing guides and tips
4. **Noticias** (`noticias`) - News and updates
5. **Productores** (`productores`) - Producer stories

## Views

Pre-built SQL views for common queries:

### active_subscriptions_view

Shows all active subscriptions with user, plan, and grind type details.

### monthly_revenue_view

Revenue analytics grouped by month.

### blog_posts_with_author

Blog posts with author and category information joined.

## Indexes

Optimized indexes for common queries:

- User email and Stripe customer ID lookups
- Order and subscription status filtering
- Blog post search and filtering
- Geographic lookups (state codes)
- Payment tracking

## Security Notes

1. **Password Storage**: All passwords use bcrypt with 10 rounds
2. **Admin Separation**: Admins and users are completely separate tables
3. **Activity Logging**: All admin actions logged for audit
4. **Soft Deletes**: Use `is_active` flags instead of hard deletes where appropriate
5. **Foreign Keys**: Proper CASCADE and SET NULL rules for data integrity

## Default Data

### Default Admin

- Username: `admin`
- Email: `admin@bolsadecafe.com`
- Password: `Admin123!` ⚠️ **CHANGE IMMEDIATELY**
- Role: `super_admin`

### Grind Types

5 default grind types pre-populated

### Mexico States

All 32 states pre-populated

### Subscription Plans

3 plans pre-populated (250gr, 500gr, 1kg)

### Blog Categories

5 default categories pre-populated

## Migration Notes

When updating the schema:

1. Always backup the database first
2. Test migrations on a development database
3. Use transactions for complex updates
4. Update the `updated_at` timestamp where applicable
5. Log schema changes in admin_logs

## Performance Recommendations

1. **Indexes**: Already optimized for common queries
2. **Full-Text Search**: Available on blog_posts (title, excerpt, content)
3. **Pagination**: Always paginate large result sets (blog posts, orders)
4. **Caching**: Consider caching grind_types and mexico_states
5. **Archiving**: Regularly archive old webhook_events and admin_logs

## API Integration

The database schema maps to API endpoints:

- `/api/plans` → subscription_plans table
- `/api/grind-types` → grind_types table
- `/api/states` → mexico_states table
- `/api/blog/posts` → blog_posts with relations

See `shared/api.ts` for TypeScript interfaces that match these tables.
