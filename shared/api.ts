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

// ─── User Dashboard ───────────────────────────────────────────────────────────

export interface UserSubscriptionDetail {
  id: number;
  status:
    | "active"
    | "cancelled"
    | "paused"
    | "past_due"
    | "incomplete"
    | "trialing";
  planId: number;
  planName: string;
  planWeight: string;
  planPrice: number;
  grindTypeId: number;
  grindTypeName: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  createdAt: string;
  shippingAddress?: {
    id: number;
    fullName: string;
    streetAddress: string;
    streetAddress2?: string;
    apartmentNumber?: string;
    deliveryInstructions?: string;
    city: string;
    state: string;
    stateId: number;
    postalCode: string;
    phone?: string;
  };
}

export interface UserSubscriptionResponse {
  success: boolean;
  subscriptions: UserSubscriptionDetail[];
}

export interface UpdateAddressRequest {
  subscriptionId: number;
  fullName: string;
  streetAddress: string;
  streetAddress2?: string;
  apartmentNumber?: string;
  deliveryInstructions?: string;
  city: string;
  stateId: number;
  postalCode: string;
  phone?: string;
}

export interface UpdateAddressResponse {
  success: boolean;
  message: string;
}

export interface UpdateDeliveryContactRequest {
  subscriptionId: number;
  fullName: string;
}

export interface UpgradePlanRequest {
  subscriptionId: number;
  newPlanId: number;
}

export interface UpgradePlanResponse {
  success: boolean;
  message: string;
}

export interface CancelSubscriptionRequest {
  subscriptionId: number;
  /** Must match "CANCELAR MI SUSCRIPCIÓN" to confirm */
  confirmPhrase: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
}

export interface BillingPortalResponse {
  success: boolean;
  url: string;
}

// ─── Payment Methods ──────────────────────────────────────────────────────────

export interface SavedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface SetupIntentResponse {
  clientSecret: string;
}

export interface PaymentMethodsResponse {
  paymentMethods: SavedPaymentMethod[];
  defaultPaymentMethodId: string | null;
}

export interface CreateSubscriptionRequest {
  paymentMethodId: string;
  planId: string;
  grindTypeId?: string;
  address?: {
    full_name: string;
    street_address: string;
    street_address_2?: string | null;
    apartment_number?: string | null;
    delivery_instructions?: string | null;
    city: string;
    state_id: number;
    postal_code: string;
    country?: string;
    phone?: string | null;
    is_default?: number;
  };
}

export interface CreateSubscriptionResponse {
  success: boolean;
  subscription?: any;
  requiresAction?: boolean;
  clientSecret?: string;
  stripeSubscriptionId?: string;
  error?: string;
}

// ─── Help Center / Contact Form ───────────────────────────────────────────────

export type ContactTopic =
  | "suscripcion"
  | "pagos"
  | "envios"
  | "cuenta"
  | "producto"
  | "otro";

export interface SubmitContactRequest {
  name: string;
  email: string;
  topic: ContactTopic;
  subject: string;
  message: string;
}

export interface SubmitContactResponse {
  success: boolean;
  message: string;
  submissionId: number;
}

// ─── Home (consolidated initial load) ────────────────────────────────────────

/** Minimal user shape returned by GET /api/home when a valid token is sent */
export interface HomeUser {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  email_verified: boolean;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: "super_admin" | "admin" | "support";
  avatar_url?: string;
  bio?: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  sessionToken: string;
  admin: AdminUser;
}

export interface AdminDashboardMetrics {
  totalSubscribers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  ordersInPipeline: number;
  ordersThisMonth: number;
  newClientsThisMonth: number;
  revenueByMonth: Array<{ month: string; revenue: number; orders: number }>;
}

export interface AdminOrderItem {
  id: number;
  orderId: number;
  planName: string;
  weight: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  totalAmount: number;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  shipmentProvider?: string;
  estimatedDelivery?: string;
  notes?: string;
  // User info
  userId: number;
  userEmail: string;
  userFullName: string;
  userPhone?: string;
  // Plan info
  planName?: string;
  planWeight?: string;
  grindTypeName?: string;
  // Address
  addressFullName?: string;
  addressStreet?: string;
  addressStreet2?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressPhone?: string;
  // Subscription
  subscriptionId?: number;
  // Coffee catalog
  coffeeCatalogId?: number;
  coffeeCatalogName?: string;
  // Costs (shipping label + supplies)
  shippingLabelCost?: number;
  supplyCost?: number;
}

export interface MoveOrderToShippingRequest {
  orderId: number;
  trackingNumber: string;
  shipmentProvider: string;
  estimatedDelivery: string;
  coffeeCatalogId?: number | null;
  shippingLabelCost?: number | null;
  supplyCost?: number | null;
}

export interface MoveOrderToDeliveredRequest {
  orderId: number;
  blogPostTitle?: string;
  blogPostContent?: string;
}

export interface AdminClient {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  stripe_customer_id?: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Subscription info
  subscription_status?: string;
  plan_name?: string;
  total_orders: number;
  total_spent: number;
}

export interface AdminUpdateSettingsRequest {
  full_name: string;
  email: string;
  bio?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AdminPerson {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: "super_admin" | "admin" | "support";
  is_active: boolean;
  bio?: string;
  avatar_url?: string;
  last_login?: string;
  created_at: string;
}

export interface CreateAdminPersonRequest {
  username: string;
  email: string;
  full_name: string;
  role: "super_admin" | "admin" | "support";
  bio?: string;
}

export interface UpdateAdminPersonRequest {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: "super_admin" | "admin" | "support";
  is_active: boolean;
  bio?: string;
}

/** Single endpoint response — replaces separate /api/plans, /api/grind-types,
 *  /api/states, and /api/auth/validate round-trips */
export interface HomeResponse {
  plans: SubscriptionPlan[];
  grindTypes: GrindType[];
  states: MexicoState[];
  user: HomeUser | null;
}

// ─── Visitor Tracking ─────────────────────────────────────────────────────────

export type VisitorEventType =
  | "page_view"
  | "click"
  | "scroll"
  | "form_submit"
  | "subscription_start"
  | "subscription_complete"
  | "auth_open"
  | "auth_success"
  | "plan_select"
  | "checkout_start"
  | "checkout_complete"
  | "payment_method_added"
  | "payment_method_removed";

export interface TrackEventRequest {
  session_id: string;
  event_type?: VisitorEventType;
  page: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  duration_ms?: number;
  metadata?: Record<string, unknown>;
}

export interface TrackEventResponse {
  success: boolean;
}

// ─── Coffee Catalog ───────────────────────────────────────────────────────────

export type RoastLevel =
  | "light"
  | "medium_light"
  | "medium"
  | "medium_dark"
  | "dark";

export interface CoffeeCatalog {
  id: number;
  name: string;
  provider: string;
  origin?: string;
  coffeeType?: string;
  variety?: string;
  process?: string;
  roastLevel?: RoastLevel;
  altitudeMin?: number;
  altitudeMax?: number;
  tastingNotes?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdByAdminId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoffeeCatalogListResponse {
  success: boolean;
  coffees: CoffeeCatalog[];
}

export interface CoffeeCatalogResponse {
  success: boolean;
  coffee: CoffeeCatalog;
}

export interface CreateCoffeeCatalogRequest {
  name: string;
  provider: string;
  origin?: string;
  coffeeType?: string;
  variety?: string;
  process?: string;
  roastLevel?: RoastLevel;
  altitudeMin?: number;
  altitudeMax?: number;
  tastingNotes?: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCoffeeCatalogRequest extends CreateCoffeeCatalogRequest {
  id: number;
  isActive?: boolean;
}

// ─── Admin Blog ───────────────────────────────────────────────────────────────

export interface AdminBlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  authorId: number;
  authorName?: string;
  categoryId?: number;
  categoryName?: string;
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  views: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminBlogPostsResponse {
  success: boolean;
  posts: AdminBlogPost[];
  total: number;
}

export interface AdminBlogPostResponse {
  success: boolean;
  post: AdminBlogPost;
}

export interface AdminBlogCategoriesResponse {
  success: boolean;
  categories: AdminBlogCategory[];
}

export interface AdminCreateBlogPostRequest {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  categoryId?: number | null;
  status: "draft" | "published" | "archived";
  publishedAt?: string | null;
  metaTitle?: string;
  metaDescription?: string;
}

export interface AdminUpdateBlogPostRequest extends AdminCreateBlogPostRequest {
  id: number;
}
