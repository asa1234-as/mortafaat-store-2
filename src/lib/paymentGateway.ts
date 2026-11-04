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
 * 2. Paymob Adapter (Ready for integration upon providing Merchant credentials in Supabase Edge Function Secrets)
 */
export class PaymobAdapter implements PaymentGatewayAdapter {
  readonly provider = 'paymob' as const;
  private readonly isConfigured: boolean;

  constructor(apiKey?: string, integrationId?: string) {
    // Only available if real merchant credentials exist (never placeholder or mock)
    this.isConfigured = Boolean(apiKey && integrationId && !apiKey.includes('YOUR_') && !apiKey.includes('sample'));
  }

  get isAvailable(): boolean {
    return this.isConfigured;
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResult> {
    if (!this.isAvailable) {
      throw new Error('بوابة Paymob غير مفعلة حالياً لعدم ربط بيانات التاجر الحقيقية ومفاتيح الربط في Supabase Edge Function Secrets.');
    }

    // Call server-side Supabase Edge Function to safely create Paymob session without exposing secrets
    const edgeFunctionUrl = `${request.returnUrl.replace(/\/$/, '')}/functions/v1/create-payment-intent`;
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'paymob',
        orderId: request.orderId,
        amountCents: request.amountCents,
        currency: request.currency,
        customer: request.customer,
        returnUrl: request.returnUrl
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'فشل إنشاء جلسة الدفع الإلكتروني مع مزود الخدمة Paymob.');
    }

    const data = await response.json();
    return {
      success: true,
      provider: 'paymob',
      redirectUrl: data.redirectUrl,
      referenceId: data.referenceId || `PAYMOB-${request.orderId}`,
      isImmediateSettlement: false
    };
  }
}

/**
 * 3. Kashier Adapter (Ready for integration upon providing Merchant ID and Secret Key in Supabase Edge Function Secrets)
 */
export class KashierAdapter implements PaymentGatewayAdapter {
  readonly provider = 'kashier' as const;
  private readonly isConfigured: boolean;

  constructor(merchantId?: string) {
    this.isConfigured = Boolean(merchantId && !merchantId.includes('YOUR_') && !merchantId.includes('sample'));
  }

  get isAvailable(): boolean {
    return this.isConfigured;
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResult> {
    if (!this.isAvailable) {
      throw new Error('بوابة Kashier غير مفعلة حالياً لعدم ربط Merchant ID والمفاتيح الحقيقية.');
    }

    const edgeFunctionUrl = `${request.returnUrl.replace(/\/$/, '')}/functions/v1/create-payment-intent`;
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'kashier',
        orderId: request.orderId,
        amount: request.amount,
        customer: request.customer,
        returnUrl: request.returnUrl
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'فشل إنشاء جلسة الدفع مع بوابة Kashier.');
    }

    const data = await response.json();
    return {
      success: true,
      provider: 'kashier',
      redirectUrl: data.redirectUrl,
      referenceId: data.referenceId || `KASHIER-${request.orderId}`,
      isImmediateSettlement: false
    };
  }
}

/**
 * 4. Fawry Adapter (Ready for integration upon providing Merchant Code and Security Key)
 */
export class FawryAdapter implements PaymentGatewayAdapter {
  readonly provider = 'fawry' as const;
  private readonly isConfigured: boolean;

  constructor(merchantCode?: string) {
    this.isConfigured = Boolean(merchantCode && !merchantCode.includes('YOUR_') && !merchantCode.includes('sample'));
  }

  get isAvailable(): boolean {
    return this.isConfigured;
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResult> {
    if (!this.isAvailable) {
      throw new Error('خدمة فوري غير مفعلة حالياً لعدم ربط Merchant Code والمفاتيح الحقيقية.');
    }

    const edgeFunctionUrl = `${request.returnUrl.replace(/\/$/, '')}/functions/v1/create-payment-intent`;
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'fawry',
        orderId: request.orderId,
        amount: request.amount,
        customer: request.customer
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'فشل إصدار كود الدفع من فوري.');
    }

    const data = await response.json();
    return {
      success: true,
      provider: 'fawry',
      referenceId: data.referenceId || `FAWRY-${request.orderId}`,
      instructions: data.instructions || 'توجه لأقرب منفذ فوري واستخدم كود الدفع الخاص بطلبك.',
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
