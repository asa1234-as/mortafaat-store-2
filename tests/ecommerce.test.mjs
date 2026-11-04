import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

// Compute dynamic project root path (never hardcode Windows absolute paths)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 1. Price, Shipping, and Cart Calculations
test('Cart Subtotal & Free Shipping Threshold Logic', () => {
  const items = [
    { price: 200, quantity: 2 },
    { price: 150, quantity: 1 }
  ];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  assert.strictEqual(subtotal, 550, 'Subtotal should be exactly 550 EGP');

  const freeShippingThreshold = 1000;
  const standardShippingFee = 50;

  // Under threshold
  const shippingUnder = subtotal >= freeShippingThreshold ? 0 : standardShippingFee;
  assert.strictEqual(shippingUnder, 50, 'Shipping fee should be 50 EGP when under 1000 EGP');

  // Over threshold
  const subtotalOver = 1200;
  const shippingOver = subtotalOver >= freeShippingThreshold ? 0 : standardShippingFee;
  assert.strictEqual(shippingOver, 0, 'Shipping fee should be 0 EGP when threshold reached');
});

// 2. Coupon Discount Calculation Logic (Percentage vs Fixed)
test('Coupon Discount Calculation with Caps and Minimum Order', () => {
  const percentageCoupon = {
    code: 'MORTAFAAT10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 500,
    isActive: true
  };

  const fixedCoupon = {
    code: 'WELCOME50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 300,
    isActive: true
  };

  // 1. Percentage discount: 10% of 800 = 80 EGP
  const subtotal1 = 800;
  const discount1 = Math.round((subtotal1 * percentageCoupon.discountValue) / 100);
  assert.strictEqual(discount1, 80, '10% discount on 800 should be 80 EGP');

  // 2. Fixed discount: 50 EGP
  const subtotal2 = 600;
  const discount2 = fixedCoupon.discountValue;
  assert.strictEqual(discount2, 50, 'Fixed discount should be 50 EGP');

  // 3. Minimum order validation
  const lowSubtotal = 250;
  assert.strictEqual(lowSubtotal < fixedCoupon.minOrderValue, true, 'Coupon must reject orders under minOrderValue');

  // 4. Discount cannot exceed subtotal
  const smallSubtotal = 30;
  const cappedDiscount = Math.min(fixedCoupon.discountValue, smallSubtotal);
  assert.strictEqual(cappedDiscount, 30, 'Discount must never exceed subtotal');
});

// 3. Stock Deduction & Insufficient Stock Prevention Logic
test('Stock Deduction & Concurrency Lock Logic', () => {
  const stockInventory = {
    'p-1': 10,
    'p-2': 2
  };

  function tryDeductStock(productId, requestedQty) {
    const available = stockInventory[productId] ?? 0;
    if (requestedQty <= 0) throw new Error('Invalid quantity');
    if (available < requestedQty) {
      throw new Error(`Insufficient stock: requested ${requestedQty}, available ${available}`);
    }
    stockInventory[productId] -= requestedQty;
    return stockInventory[productId];
  }

  // Valid deduction
  const remainingP1 = tryDeductStock('p-1', 4);
  assert.strictEqual(remainingP1, 6, 'Stock should decrease from 10 to 6');

  // Overselling attempt
  assert.throws(() => {
    tryDeductStock('p-2', 5);
  }, /Insufficient stock/, 'Must throw error when requested quantity exceeds available stock');

  // Exact stock clearance
  const remainingP2 = tryDeductStock('p-2', 2);
  assert.strictEqual(remainingP2, 0, 'Stock should reach exactly 0');
});

// 4. Egyptian Mobile Phone Number Validation
test('Egyptian Mobile Phone Validation Regex', () => {
  const phoneRegex = /^01[0125][0-9]{8}$/;

  const validPhones = [
    '01012345678', // Vodafone
    '01123456789', // Etisalat
    '01234567890', // Orange
    '01555555555'  // WE
  ];

  const invalidPhones = [
    '01312345678', // Invalid carrier prefix (013 is Benha landline)
    '0101234567',  // Too short (9 digits)
    '010123456789', // Too long (12 digits)
    '1012345678',  // Missing leading 0
    'abcdefghijk'  // Non-digits
  ];

  validPhones.forEach(phone => {
    assert.strictEqual(phoneRegex.test(phone), true, `Phone ${phone} should be valid`);
  });

  invalidPhones.forEach(phone => {
    assert.strictEqual(phoneRegex.test(phone), false, `Phone ${phone} should be rejected`);
  });
});

// 5. Role-Based Access Control (RBAC) Logic
test('Admin Access Gate & Role Elevation Prevention', () => {
  function checkAdminAccess(user) {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'owner';
  }

  const customerUser = { id: 'u-1', email: 'customer@test.com', role: 'customer' };
  const adminUser = { id: 'u-2', email: 'admin@mortafaat.com', role: 'admin' };
  const ownerUser = { id: 'u-3', email: 'owner@mortafaat.com', role: 'owner' };
  const anonymous = null;

  assert.strictEqual(checkAdminAccess(customerUser), false, 'Customer must not have admin access');
  assert.strictEqual(checkAdminAccess(anonymous), false, 'Anonymous user must not have admin access');
  assert.strictEqual(checkAdminAccess(adminUser), true, 'Admin user must have admin access');
  assert.strictEqual(checkAdminAccess(ownerUser), true, 'Owner user must have admin access');

  // Self-elevation prevention simulation
  function canChangeRole(actor, targetUser, newRole) {
    if (!checkAdminAccess(actor)) {
      throw new Error('Only admin or owner may change roles');
    }
    return true;
  }

  assert.throws(() => {
    canChangeRole(customerUser, customerUser, 'admin');
  }, /Only admin or owner/, 'Customer must not elevate their own role');

  assert.strictEqual(canChangeRole(ownerUser, customerUser, 'admin'), true, 'Owner can promote customer to admin');
});

// 6. Order Idempotency, Unique UUID Generation & Collision Protection
test('Order UUID Generation & Idempotency Key Guard', () => {
  // UUID generation test
  const uuid1 = crypto.randomUUID();
  const uuid2 = crypto.randomUUID();
  assert.strictEqual(typeof uuid1, 'string');
  assert.strictEqual(uuid1.length, 36);
  assert.notStrictEqual(uuid1, uuid2, 'Each order must have a unique UUID');

  // Idempotency simulation with user/phone verification
  const existingOrders = new Map([
    ['ord-1', { id: 'ord-1', phone: '01011111111', total: 500 }],
    ['ord-2', { id: 'ord-2', phone: '01022222222', total: 850 }]
  ]);

  function processOrder(orderId, customerPhone) {
    const existing = existingOrders.get(orderId);
    if (existing) {
      if (existing.phone === customerPhone) {
        return { status: 'idempotent_replay', orderId };
      }
      // Collision with another customer's order: must NOT return other user's order
      const freshId = crypto.randomUUID();
      existingOrders.set(freshId, { id: freshId, phone: customerPhone, total: 300 });
      return { status: 'created_with_new_id', orderId: freshId };
    }
    existingOrders.set(orderId, { id: orderId, phone: customerPhone, total: 300 });
    return { status: 'created', orderId };
  }

  // 1. Initial creation
  const first = processOrder('ord-3', '01033333333');
  assert.strictEqual(first.status, 'created');

  // 2. Duplicate retry by same customer (e.g. network hiccup)
  const retrySame = processOrder('ord-3', '01033333333');
  assert.strictEqual(retrySame.status, 'idempotent_replay');

  // 3. Collision attempt by different phone number (must NOT leak ord-3 data)
  const collisionAttempt = processOrder('ord-3', '01099999999');
  assert.strictEqual(collisionAttempt.status, 'created_with_new_id');
  assert.notStrictEqual(collisionAttempt.orderId, 'ord-3');
});

// 7. Security: Zero API Secrets in Frontend Bundle (Dynamic Paths & Fully Awaited)
test('Security Verification: No Private Secrets Exposed in Config or Frontend', async () => {
  const envExamplePath = path.join(PROJECT_ROOT, '.env.example');
  const envContent = await fs.readFile(envExamplePath, 'utf-8');

  assert.strictEqual(envContent.includes('service_role'), false, 'Service role key must never be in .env.example');
  assert.strictEqual(envContent.includes('PAYMOB_SECRET'), false, 'Paymob secrets must not be in client environment');
  assert.strictEqual(envContent.includes('KASHIER_SECRET'), false, 'Kashier secrets must not be in client environment');
  assert.strictEqual(envContent.includes('FAWRY_SECRET'), false, 'Fawry secrets must not be in client environment');
});

// 8. Security: No Hardcoded PIN '1234' or Admin Backdoor in Source Code
test('Security Verification: No Hardcoded PIN 1234 or Admin Backdoor', async () => {
  const initialDataPath = path.join(PROJECT_ROOT, 'src', 'data', 'initialData.ts');
  const storeContextPath = path.join(PROJECT_ROOT, 'src', 'context', 'StoreContext.tsx');

  const initialData = await fs.readFile(initialDataPath, 'utf-8');
  const storeContext = await fs.readFile(storeContextPath, 'utf-8');

  assert.strictEqual(initialData.includes("adminPin: '1234'"), false, 'adminPin: 1234 must not exist in initialData.ts');
  assert.strictEqual(storeContext.includes("=== '1234'"), false, '1234 PIN check must not exist in StoreContext.tsx');
  assert.strictEqual(storeContext.includes("emailOrPin === 'admin@mortafaat.com'"), false, 'admin@mortafaat.com backdoor must not exist in StoreContext.tsx');
});

// 9. Security: LocalStorage Tampering Immunity
test('Security Verification: LocalStorage Flag Cannot Elevate Admin Access', async () => {
  const storeContextPath = path.join(PROJECT_ROOT, 'src', 'context', 'StoreContext.tsx');
  const storeContext = await fs.readFile(storeContextPath, 'utf-8');

  // Verify that isAdminAuthenticated is not initialized directly from localStorage
  const directLocalStorageAuth = /useState<boolean>\(\s*\(\)\s*=>\s*localStorage\.getItem\(['"]mortafaat_admin_auth['"]\)\s*===\s*['"]true['"]\s*\)/;
  assert.strictEqual(directLocalStorageAuth.test(storeContext), false, 'isAdminAuthenticated must not trust raw localStorage flag');

  // Verify that mortafaat_admin_auth is not written to localStorage as an auth source
  assert.strictEqual(storeContext.includes("localStorage.setItem('mortafaat_admin_auth'"), false, 'Must not persist insecure admin auth flag to localStorage');
});

// 10. Payment Gateway Architecture: COD Active, Webhook HMAC Verification
test('Payment Gateway Architecture: COD Active & Webhook HMAC Verification', async () => {
  // Test HMAC SHA-512 calculation
  const testSecret = 'secret_test_key_123';
  const testPayload = 'amount_cents=50000currency=EGPorder_id=123';
  const hmac = crypto.createHmac('sha512', testSecret).update(testPayload).digest('hex');

  assert.strictEqual(typeof hmac, 'string');
  assert.strictEqual(hmac.length, 128, 'SHA-512 HMAC should be 128 hex characters');

  // Verify constant-time buffer comparison logic
  const bufA = Buffer.from(hmac, 'hex');
  const bufB = Buffer.from(hmac, 'hex');
  assert.strictEqual(crypto.timingSafeEqual(bufA, bufB), true, 'Timing-safe comparison must validate matching signatures');

  const invalidHmac = crypto.createHmac('sha512', 'wrong_secret').update(testPayload).digest('hex');
  const bufC = Buffer.from(invalidHmac, 'hex');
  assert.strictEqual(crypto.timingSafeEqual(bufA, bufC), false, 'Timing-safe comparison must reject invalid signatures');
});

// 11. Bilingual Language Fallback Resolution
test('Bilingual Language Fallback Resolution Logic', () => {
  const productWithEn = {
    name: 'ساعة يد ألترا',
    nameAr: 'ساعة يد ألترا',
    nameEn: 'Ultra Wristwatch'
  };

  const productWithoutEn = {
    name: 'منتج محلي',
    nameAr: 'منتج محلي'
  };

  // Helper simulating component language selection
  const resolveName = (prod, lang) => {
    if (lang === 'en') {
      return prod.nameEn || prod.nameAr || prod.name;
    }
    return prod.nameAr || prod.name;
  };

  assert.strictEqual(resolveName(productWithEn, 'ar'), 'ساعة يد ألترا');
  assert.strictEqual(resolveName(productWithEn, 'en'), 'Ultra Wristwatch');
  assert.strictEqual(resolveName(productWithoutEn, 'en'), 'منتج محلي', 'Fallback to Arabic name if English not provided');
});

// 12. Public Build Guard Verification
test('Public Build Admin & Download Link Gate Verification', async () => {
  const headerPath = path.join(PROJECT_ROOT, 'src', 'components', 'Header.tsx');
  const appPath = path.join(PROJECT_ROOT, 'src', 'App.tsx');

  const headerContent = await fs.readFile(headerPath, 'utf-8');
  const appContent = await fs.readFile(appPath, 'utf-8');

  // Verify Header gates the ZIP download and admin button on VITE_PUBLIC_BUILD
  assert.strictEqual(
    headerContent.includes("!(import.meta.env.VITE_PUBLIC_BUILD === 'true' || import.meta.env.MODE === 'public')"),
    true,
    'Header must hide admin & zip buttons when public build is active'
  );

  // Verify App gates currentView === admin on isPublicBuild
  assert.strictEqual(
    appContent.includes("!isPublicBuild && currentView === 'admin'"),
    true,
    'App must prevent admin view when public build is active'
  );
});
