export interface Product {
  id: string;
  name: string;
  nameEn: string;
  category: 'electronics' | 'fashion' | 'perfumes' | 'home' | 'personal-care';
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewsCount: number;
  features: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  isFeatured?: boolean;
  isDeal?: boolean;
  dealDiscount?: number;
}

export interface Category {
  id: 'electronics' | 'fashion' | 'perfumes' | 'home' | 'personal-care';
  nameAr: string;
  nameEn: string;
  icon: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type PaymentMethod = 'cod' | 'online-gateway';

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
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

export interface BotKnowledgeRule {
  id: string;
  title: string;
  keywords: string[];
  replyText: string;
  isActive: boolean;
}

export interface StoreSettings {
  storeNameAr: string;
  storeNameEn: string;
  phone: string;
  whatsapp: string;
  shippingFee: number;
  freeShippingThreshold: number;
  announcementText: string;
  adminPin: string;

  // Dynamic Payment Gateway Configuration (For Kashier / Fawry / Paymob etc.)
  isOnlinePaymentEnabled: boolean;
  onlineGatewayName: string;
  onlineGatewayLogoUrl: string;
  onlineGatewayMerchantId: string;
  onlineGatewayApiKey: string;
  onlineGatewaySecretKey: string;
  onlineGatewayEnvironment: 'live' | 'test';
  onlineGatewayNotice: string;

  // Store Policies (Required by Fawry / Kashier for account approval)
  returnPolicyText: string;
  shippingPolicyText: string;
  privacyPolicyText: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'support' | 'bot';
  senderName?: string;
  text: string;
  time: string;
  readByAdmin?: boolean;
}
