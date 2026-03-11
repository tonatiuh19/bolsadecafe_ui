/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Subscription Plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceId?: string;
  weight: string;
  description: string;
  features?: string[];
}

export interface PlansResponse {
  plans: SubscriptionPlan[];
}

// Checkout
export interface CreateCheckoutSessionRequest {
  planId: string;
  email: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId?: string;
  url?: string;
  message?: string;
  plan?: SubscriptionPlan;
  email?: string;
}

// User
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  stripeCustomerId?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Address
export interface Address {
  id?: number;
  userId?: number;
  addressType: "shipping" | "billing";
  fullName: string;
  streetAddress: string;
  streetAddress2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// Subscription
export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  stripeSubscriptionId?: string;
  status:
    | "active"
    | "cancelled"
    | "paused"
    | "past_due"
    | "incomplete"
    | "trialing";
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Order
export interface Order {
  id: number;
  userId: number;
  subscriptionId?: number;
  orderNumber: string;
  stripePaymentIntentId?: string;
  totalAmount: number;
  currency: string;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  shippingAddressId?: number;
  billingAddressId?: number;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Grind Type
export interface GrindType {
  id: number;
  name: string;
  code: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface GrindTypesResponse {
  grindTypes: GrindType[];
}

// Mexico State
export interface MexicoState {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

export interface MexicoStatesResponse {
  states: MexicoState[];
}

// Blog Category
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

// Blog Tag
export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

// Blog Post Author
export interface BlogAuthor {
  id: number;
  fullName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
}

// Blog Post
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  authorId: number;
  author?: BlogAuthor;
  categoryId?: number;
  category?: BlogCategory;
  tags?: BlogTag[];
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  views: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  perPage: number;
}

export interface BlogPostResponse {
  post: BlogPost;
}

// Blog Comment
export interface BlogComment {
  id: number;
  postId: number;
  userId?: number;
  authorName?: string;
  authorEmail?: string;
  content: string;
  status: "pending" | "approved" | "spam" | "trash";
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment
export interface Payment {
  id: number;
  userId: number;
  orderId?: number;
  subscriptionId?: number;
  stripePaymentId?: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded" | "cancelled";
  paymentMethod?: string;
  failureReason?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Business Inquiry
export interface BusinessInquiry {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  monthly_consumption: string;
  employees_count: string;
  current_supplier?: string;
  message?: string;
}

export interface CreateBusinessInquiryRequest extends BusinessInquiry {}

export interface CreateBusinessInquiryResponse {
  success: boolean;
  message: string;
  inquiry_id: number;
}
