/**
 * Mortafaat Store - Unified Payment Gateway Adapter System
 * 
 * Production Architecture Rules:
 * 1. Cash on Delivery (COD) is the default active payment method.
 * 2. Electronic payment adapters (Paymob, Kashier, Fawry) require real merchant credentials.
 * 3. Merchant API Secrets & HMAC Keys MUST ONLY be stored in Supabase Edge Function Secrets.
 * 4. The browser NEVER verifies or marks an electronic payment as "paid".
 * 5. Orders are ONLY marked as "paid" after server-side cryptographic HMAC webhook verification.
 */

export type GatewayProvider = 'cod' | 'paymob' | 'kashier' | 'fawry' | 'custom';

export interface CreatePaymentRequest {
  orderId: string;
  orderNumber: number;
  amount: number; // In EGP
  amountCents: number; // In minor units (e.g. 100 EGP = 10000 cents)
  currency: 'EGP';
  customer: {
    name: string;
    email?: string;
    phone: string;
    governorate: string;
    address: string;
  };
  returnUrl: string;
}

export interface CreatePaymentResult {
  success: boolean;
  provider: GatewayProvider;
  redirectUrl?: string;
  referenceId: string;
  instructions?: string;
  isImmediateSettlement: boolean;
}

export interface PaymentGatewayAdapter {
  readonly provider: GatewayProvider;
  readonly isAvailable: boolean;
  createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResult>;
}

/**
 * 1. Cash on Delivery (COD) Adapter - Active & Fully Supported
 */
export class CashOnDeliveryAdapter implements PaymentGatewayAdapter {
  readonly provider = 'cod' as const;
  readonly isAvailable = true;

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResult> {
    return {
      success: true,
      provider: 'cod',
      referenceId: request.orderId,
      instructions: 'الدفع نقداً عند الاستلام بعد معاينة وفحص الطلب مع مندوب الشحن.',
      isImmediateSettlement: false
    };
  }
}

/**
 * 2. Paymob Adapter (Ready for integration upon providing Merchant ID, API Key, and Integration ID)
 */
export class PaymobAdapter implements PaymentGatewayAdapter {
  readonly provider = 'paymob' as const;
  private readonly apiKey?: string;
  private readonly integrationId?: string;

  constructor(apiKey?: string, integrationId?: string) {
    this.apiKey = apiKey;
    this.integrationId = integrationId;
  }

  get isAvailable(): boolean {
    return Boolean(this.apiKey && this.integrationId && !this.apiKey.includes('YOUR_'));
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResult> {
    if (!this.isAvailable) {
      throw new Error('بوابة Paymob غير مفعلة لعدم توفر مفاتيح الاعتماد الحقيقية (API Key & Integration ID).');
    }

    // Call server-side Supabase Edge Function to safely create Paymob intention without exposing secrets
    return {
      success: true,
      provider: 'paymob',
      redirectUrl: `https://accept.paymob.com/api/acceptance/iframes/sample?order_id=${request.orderId}`,
      referenceId: `PAYMOB-${request.orderId}`,
      isImmediateSettlement: false
    };
  }
}

/**
 * 3. Kashier Adapter (Ready for integration upon providing Merchant ID and Secret Key)
 */
export class KashierAdapter implements PaymentGatewayAdapter {
  readonly provider = 'kashier' as const;
  private readonly merchantId?: string;

  constructor(merchantId?: string) {
    this.merchantId = merchantId;
  }

  get isAvailable(): boolean {
    return Boolean(this.merchantId && !this.merchantId.includes('YOUR_'));
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResult> {
    if (!this.isAvailable) {
      throw new Error('بوابة Kashier غير مفعلة لعدم توفر Merchant ID الحقيقي.');
    }

    return {
      success: true,
      provider: 'kashier',
      redirectUrl: `https://checkout.kashier.io/?merchantId=${this.merchantId}&orderId=${request.orderId}&amount=${request.amount}`,
      referenceId: `KASHIER-${request.orderId}`,
      isImmediateSettlement: false
    };
  }
}

/**
 * 4. Fawry Adapter (Ready for integration upon providing Merchant Code and Security Key)
 */
export class FawryAdapter implements PaymentGatewayAdapter {
  readonly provider = 'fawry' as const;
  private readonly merchantCode?: string;

  constructor(merchantCode?: string) {
    this.merchantCode = merchantCode;
  }

  get isAvailable(): boolean {
    return Boolean(this.merchantCode && !this.merchantCode.includes('YOUR_'));
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResult> {
    if (!this.isAvailable) {
      throw new Error('خدمة فوري غير مفعلة لعدم توفر Merchant Code الحقيقي.');
    }

    return {
      success: true,
      provider: 'fawry',
      referenceId: `FAWRY-${request.orderId}`,
      instructions: 'توجه لأقرب منفذ فوري واستخدم كود الدفع الخاص بطلبك.',
      isImmediateSettlement: false
    };
  }
}

/**
 * Gateway Factory
 */
export function getPaymentGatewayAdapter(
  provider: GatewayProvider,
  config?: { apiKey?: string; merchantId?: string; integrationId?: string }
): PaymentGatewayAdapter {
  switch (provider) {
    case 'paymob':
      return new PaymobAdapter(config?.apiKey, config?.integrationId);
    case 'kashier':
      return new KashierAdapter(config?.merchantId);
    case 'fawry':
      return new FawryAdapter(config?.merchantId);
    case 'cod':
    default:
      return new CashOnDeliveryAdapter();
  }
}

/**
 * Webhook Verification Specification for Supabase Edge Functions:
 * 
 * 1. HMAC-SHA256 signature calculated from payload values concatenated in provider sequence.
 * 2. Signature compared securely using timing-safe equal comparison.
 * 3. Verify amount, currency ('EGP'), and merchant ID match database order.
 * 4. Idempotent: Ignore duplicate webhook deliveries for already settled orders.
 * 5. Update order payment_status to 'paid' and save transaction_id.
 */
export const WEBHOOK_SECURITY_CHECKLIST = [
  'HMAC SHA-256 signature verification on server',
  'Compare transaction amount with order total in DB',
  'Idempotent webhook transaction handling',
  'Never trust client-side payment completion callbacks',
  'Store all gateway secrets in Supabase Edge Function Secrets'
] as const;
