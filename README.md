# Bolsa de Café - Coffee Subscription Platform

A modern coffee subscription e-commerce platform built with React, TypeScript, Express, and configured for deployment on Vercel.

## 🚀 Features

- **Three Subscription Plans**:
  - Bolsa de Café 250gr → MX$199.00
  - Bolsa de Café 500gr → MX$299.00
  - Bolsa de Café 1kg → MX$399.00
- **Coffee Customization**:
  - Dynamic grind type selection (whole bean, coarse, medium, fine, extra fine)
  - User preferences stored with subscription
- **Blog System**:
  - Admin authors can create and publish blog posts
  - Categories, tags, and comments support
  - SEO-friendly with meta tags
- **Mexico-Specific**:
  - All 32 Mexican states with official codes
  - Service available throughout Mexico
- Modern React 18 frontend with TailwindCSS
- Express API backend configured for Vercel serverless functions
- MySQL database schema with user and admin separation
- Stripe integration ready (checkout & webhooks)
- TypeScript throughout
- Responsive design

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL database (Hostgator or similar)
- Stripe account (for payments)

## 🛠️ Installation

1. **Clone and install dependencies**:

```bash
npm install
```

2. **Configure environment variables**:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Database Configuration (Hostgator MySQL)
DB_HOST=mx50.hostgator.mx
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_SSL=false

# Stripe keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs for subscription plans
STRIPE_PRICE_250GR=price_...
STRIPE_PRICE_500GR=price_...
STRIPE_PRICE_1KG=price_...
```

3. **Setup MySQL Database**:

On your Hostgator MySQL panel:

- Create a new database
- Run the `database/schema.sql` file to create all tables
- Update `.env` with database credentials

The schema includes:

### Core Tables

- Separate `admins` and `users` tables for security
- `subscription_plans` - The 3 coffee subscription tiers
- `subscriptions` - User subscription records with grind type preference
- `orders` and `order_items` - Order management
- `payments` - Payment transaction records
- `webhook_events` - Stripe webhook event logging
- `admin_logs` - Admin activity tracking

### Coffee Configuration

- `grind_types` - Dynamic coffee grind options (whole bean, coarse, medium, fine, extra fine)

### Geographic Data

- `mexico_states` - All 32 Mexican states with official codes for address validation

### Blog System

- `blog_posts` - Blog articles with SEO support
- `blog_categories` - Post categorization
- `blog_tags` - Tag system for posts
- `blog_post_tags` - Many-to-many relationship
- `blog_comments` - User comments on posts
- Admins can be blog authors

**Important**: The default admin credentials are:

- Email: `admin@bolsadecafe.com`
- Password: `Admin123!` (⚠️ **CHANGE THIS IMMEDIATELY**)

## 🚀 Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 📦 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**:

```bash
npm i -g vercel
```

2. **Deploy**:

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

3. **Configure Environment Variables**:

In your Vercel project settings, add all environment variables from `.env`:

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_250GR`
- `STRIPE_PRICE_500GR`
- `STRIPE_PRICE_1KG`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Other variables as needed

4. **Setup Stripe Webhooks**:

In your Stripe dashboard:

- Go to Developers → Webhooks
- Add endpoint: `https://your-domain.vercel.app/api/webhook`
- Select events to listen to (e.g., `checkout.session.completed`, `invoice.paid`)
- Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET` in Vercel

## 📁 Project Structure

```
client/                 # React frontend
  ├── pages/           # Route components
  ├── components/ui/   # UI component library
  └── App.tsx          # App entry with routing

api/                    # Vercel serverless functions
  └── index.ts         # Main API routes

server/                 # Development Express server
  └── index.ts         # Server configuration

shared/                 # Shared types between client/server
  └── api.ts           # TypeScript interfaces

database/               # Database files
  └── schema.sql       # MySQL database schema

vercel.json            # Vercel deployment config
```

## 🔌 API Endpoints

All API routes are in [api/index.ts](api/index.ts):

### Subscription & Configuration

- `GET /api/ping` - Health check
- `GET /api/plans` - Get subscription plans (250gr, 500gr, 1kg)
- `GET /api/grind-types` - Get available coffee grind types
- `GET /api/states` - Get Mexico states for address forms
- `POST /api/create-checkout-session` - Create Stripe checkout (TODO: implement)

### Blog

- `GET /api/blog/posts` - Get blog posts with pagination (TODO: implement DB)
- `GET /api/blog/posts/:slug` - Get single blog post by slug (TODO: implement DB)

### Webhooks

- `POST /api/webhook` - Stripe webhook handler (TODO: implement)

## 🔐 Stripe Integration

The API structure is ready for Stripe integration. To complete:

1. **Install Stripe SDK**:

```bash
npm install stripe
```

2. **Implement checkout session creation** in `api/index.ts`:

```typescript
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

3. **Implement webhook verification** in the webhook endpoint

## 🗄️ Database Schema

The `schema.sql` file includes:

### Admin Tables

- `admins` - Admin user accounts with roles
- `admin_logs` - Activity logging for auditing

### User Tables

- `users` - Customer accounts
- `addresses` - Shipping/billing addresses

### Subscription Tables

- `subscription_plans` - The 3 coffee subscription tiers
- `subscriptions` - User subscription records

### Order Tables

- `orders` - Customer orders
- `order_items` - Line items for orders

### Payment Tables

- `payments` - Payment transaction records
- `webhook_events` - Stripe webhook event log

### Views

- `active_subscriptions_view` - Quick view of active subscriptions
- `monthly_revenue_view` - Revenue analytics

## 🧪 Testing

```bash
npm test
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run vercel-build` - Vercel build command
- `npm test` - Run tests
- `npm run typecheck` - TypeScript type checking
- `npm run format.fix` - Format code with Prettier

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and type checking
4. Submit a pull request

## 📄 License

Private - All rights reserved

## 🆘 Support

For issues or questions, contact: admin@bolsadecafe.com
