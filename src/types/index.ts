export type ThemeMode = 'light' | 'dark';
export type Language = 'ar' | 'en';
export type UserRole = 'customer' | 'admin' | 'owner';

export interface ProductReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  nameAr?: string;
  nameEn: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  images: string[];
  videoUrl?: string;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewsCount: number;
  reviews?: ProductReview[];
  features: string[];
  featuresAr?: string[];
  featuresEn?: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  isFeatured?: boolean;
  isDeal?: boolean;
  dealDiscount?: number;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  image?: string;
  itemCount?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type PaymentMethod = 'cod' | 'online-gateway';

export interface Coupon {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  usesCount?: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber?: number;
  userId?: string;
  customerName: string;
  phone: string;
  email?: string;
  governorate: string;
  address: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'unpaid' | 'pending_verification';
  transactionId?: string;
  gatewayName?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: UserRole;
  isVerified: boolean;
}

export interface HeroSlide {
  id: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  subtitle: string;
  subtitleAr?: string;
  subtitleEn?: string;
  tag: string;
  tagAr?: string;
  tagEn?: string;
  ctaText: string;
  ctaTextAr?: string;
  ctaTextEn?: string;
  targetCategory: string;
  image: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video' | 'both';
  bgGradient?: string;
  isActive?: boolean;
}

export interface BotKnowledgeRule {
  id: string;
  title: string;
  keywords: string[];
  replyText: string;
  replyTextAr?: string;
  replyTextEn?: string;
  isActive: boolean;
}

export interface StoreTrustBadge {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  descAr?: string;
  descEn?: string;
}

export interface AnnouncementOffer {
  id: string;
  textAr: string;
  textEn: string;
  link?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  durationSeconds?: number;
}

export interface StoreSettings {
  storeNameAr: string;
  storeNameEn: string;
  phone: string;
  whatsapp: string;
  shippingFee: number;
  freeShippingThreshold: number;
  announcementText: string;
  announcementTextAr?: string;
  announcementTextEn?: string;
  announcementOffers?: AnnouncementOffer[];
  announcementSpeedSeconds?: number;

  // Hero Slider timing & dimming overlay opacity (0 to 1)
  sliderIntervalSeconds: number;
  heroOverlayOpacity?: number;

  // Store Trust Badges below Hero
  trustBadges?: StoreTrustBadge[];

  // Dynamic Payment Gateway Configuration
  isOnlinePaymentEnabled: boolean;
  onlineGatewayName: string;
  onlineGatewayLogoUrl: string;
  onlineGatewayEnvironment: 'live' | 'test';
  onlineGatewayNotice: string;

  // Store Policies (Bilingual)
  returnPolicyText: string;
  returnPolicyTextAr?: string;
  returnPolicyTextEn?: string;
  shippingPolicyText: string;
  shippingPolicyTextAr?: string;
  shippingPolicyTextEn?: string;
  privacyPolicyText: string;
  privacyPolicyTextAr?: string;
  privacyPolicyTextEn?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'support' | 'bot';
  senderName?: string;
  text: string;
  time: string;
  readByAdmin?: boolean;
}

export interface AdminAuditLog {
  id: number;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: Record<string, unknown>;
  createdAt: string;
}
