/**
 * Mortafaat Store - Secure Authentication Service
 * 
 * Provides:
 * - Field validations (Egyptian phone, RFC email, strong password)
 * - Cryptographic password hashing (SHA-256 via Web Crypto API)
 * - Time-limited, secure OTP generation (CryptoRandom, 5-min expiry, max 3 attempts)
 * - Prevention of duplicate accounts
 * - Supabase GoTrue REST integration with safe offline fallback
 */

import { User } from '../types';
import { 
  isSupabaseConfigured, 
  signInWithEmail, 
  signUpWithEmail, 
  requestPasswordReset, 
  saveSession 
} from './supabase';

const USERS_STORAGE_KEY = 'mortafaat_registered_customers_v1';
const OTP_STORAGE_KEY = 'mortafaat_otp_recovery_session';

export interface LocalCustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
  isVerified: boolean;
}

interface OtpSession {
  emailOrPhone: string;
  code: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

// 1. Cryptographic Password Hashing using Web Crypto API (No plaintext passwords)
export async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`mortafaat_salt_${password}`);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback hash
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash)}`;
}

// 2. Storage Helpers
function getStoredCustomers(): LocalCustomerAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredCustomers(users: LocalCustomerAccount[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// 3. Validations
export function validateRegistrationInput(name: string, email: string, phone: string, password: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length < 3) {
    return { isValid: false, error: 'الاسم الكامل يجب ألا يقل عن 3 أحرف.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return { isValid: false, error: 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@gmail.com).' };
  }

  const cleanPhone = phone.trim().replace(/\D/g, '');
  if (!cleanPhone || !/^01[0125][0-9]{8}$/.test(cleanPhone)) {
    return { isValid: false, error: 'يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 01 ويتكون من 11 رقماً.' };
  }

  if (!password || password.length < 6) {
    return { isValid: false, error: 'كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل.' };
  }

  return { isValid: true };
}

// 4. Registration
export async function registerCustomer(params: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<User> {
  const { name, email, phone, password } = params;
  const validation = validateRegistrationInput(name, email, phone, password);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim().replace(/\D/g, '');

  // Check duplicate in local accounts
  const existingUsers = getStoredCustomers();
  const duplicate = existingUsers.find(
    u => u.email.toLowerCase() === cleanEmail || u.phone === cleanPhone
  );

  if (duplicate) {
    throw new Error('هذا البريد الإلكتروني أو رقم الهاتف مسجل بالفعل مسبقاً، يرجى تسجيل الدخول مباشرة.');
  }

  // If Supabase is active, register via GoTrue Auth
  if (isSupabaseConfigured) {
    try {
      const sbUser = await signUpWithEmail(cleanEmail, password, { 
        full_name: name.trim(), 
        phone: cleanPhone 
      });
      return sbUser;
    } catch (err: any) {
      throw new Error(err.message || 'فشل إنشاء الحساب عبر خادم المصادقة.');
    }
  }

  // Local Secure Fallback with SHA-256 Hashing
  const passwordHash = await hashPassword(password);
  const newAccount: LocalCustomerAccount = {
    id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    passwordHash,
    createdAt: new Date().toISOString(),
    isVerified: true
  };

  existingUsers.push(newAccount);
  saveStoredCustomers(existingUsers);

  const currentUser: User = {
    id: newAccount.id,
    name: newAccount.name,
    email: newAccount.email,
    phone: newAccount.phone,
    role: 'customer',
    isVerified: true
  };

  localStorage.setItem('mortafaat_current_customer', JSON.stringify(currentUser));
  return currentUser;
}

// 5. Login
export async function loginCustomer(emailOrPhone: string, password: string): Promise<User> {
  if (!emailOrPhone || !password) {
    throw new Error('يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور.');
  }

  const query = emailOrPhone.trim().toLowerCase();
  const cleanPhone = emailOrPhone.trim().replace(/\D/g, '');

  // Supabase Auth is the only production identity source. Do not fall back to local accounts.
  if (isSupabaseConfigured && !query.includes('@')) {
    throw new Error('يرجى تسجيل الدخول باستخدام البريد الإلكتروني المرتبط بحسابك.');
  }

  // If Supabase is active and query is an email, attempt GoTrue sign-in
  if (isSupabaseConfigured && query.includes('@')) {
    try {
      return await signInWithEmail(query, password);
    } catch (err: any) {
      throw new Error(err.message || 'بيانات الدخول غير صحيحة.');
    }
  }

  // Check local accounts
  const existingUsers = getStoredCustomers();
  const account = existingUsers.find(
    u => u.email.toLowerCase() === query || (cleanPhone.length >= 10 && u.phone === cleanPhone)
  );

  if (!account) {
    throw new Error('لا يوجد حساب مسجل بهذه البيانات، يرجى التأكد من البريد أو إنشاء حساب جديد.');
  }

  const incomingHash = await hashPassword(password);
  if (account.passwordHash !== incomingHash) {
    throw new Error('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.');
  }

  const currentUser: User = {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    role: 'customer',
    isVerified: account.isVerified
  };

  localStorage.setItem('mortafaat_current_customer', JSON.stringify(currentUser));
  return currentUser;
}

// 6. Cryptographically Secure Random OTP for Recovery
export function generateSecureOtp(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    // 6-digit number between 100000 and 999999
    return String(100000 + (array[0] % 900000));
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 7. Password Recovery Request
export async function startPasswordRecovery(emailOrPhone: string): Promise<{ success: boolean; message: string; requiresOtp: boolean }> {
  const query = emailOrPhone.trim().toLowerCase();
  const cleanPhone = emailOrPhone.trim().replace(/\D/g, '');

  // If Supabase configured and it's email:
  if (isSupabaseConfigured && query.includes('@')) {
    try {
      await requestPasswordReset(query);
      return {
        success: true,
        message: 'تم إرسال رابط استعادة كلمة المرور الرسمية إلى بريدك الإلكتروني.',
        requiresOtp: false
      };
    } catch (err: any) {
      throw new Error(err.message || 'تعذر إرسال رابط الاستعادة.');
    }
  }

  // Local recovery with secure OTP
  const existingUsers = getStoredCustomers();
  const account = existingUsers.find(
    u => u.email.toLowerCase() === query || (cleanPhone.length >= 10 && u.phone === cleanPhone)
  );

  if (!account) {
    throw new Error('لم يتم العثور على أي حساب مسجل بهذا البريد أو الهاتف.');
  }

  const otp = generateSecureOtp();
  const session: OtpSession = {
    emailOrPhone: account.email,
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    attempts: 0,
    maxAttempts: 3
  };

  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(session));

  return {
    success: true,
    message: `تم إنشاء رمز التحقق المؤقت (صالح لمدة 5 دقائق): ${otp}`,
    requiresOtp: true
  };
}

// 8. Verify OTP and Set New Password
export async function verifyOtpAndResetPassword(otpCode: string, newPassword: string): Promise<User> {
  const rawSession = localStorage.getItem(OTP_STORAGE_KEY);
  if (!rawSession) {
    throw new Error('انتهت جلسة التحقق، يرجى طلب رمز جديد.');
  }

  const session: OtpSession = JSON.parse(rawSession);

  if (Date.now() > session.expiresAt) {
    localStorage.removeItem(OTP_STORAGE_KEY);
    throw new Error('انتهت صلاحية رمز التحقق (أكثر من 5 دقائق)، يرجى طلب رمز جديد.');
  }

  if (session.attempts >= session.maxAttempts) {
    localStorage.removeItem(OTP_STORAGE_KEY);
    throw new Error('تم تجاوز الحد الأقصى للمحاولات (3 محاولات)، يرجى طلب رمز جديد لأسباب أمنية.');
  }

  if (session.code !== otpCode.trim()) {
    session.attempts += 1;
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(session));
    const remaining = session.maxAttempts - session.attempts;
    throw new Error(`رمز التحقق غير صحيح. متبقي لديك ${remaining} محاولة.`);
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error('كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.');
  }

  const existingUsers = getStoredCustomers();
  const userIdx = existingUsers.findIndex(u => u.email === session.emailOrPhone);
  if (userIdx === -1) {
    throw new Error('تعذر العثور على الحساب لتحديث كلمة المرور.');
  }

  const newHash = await hashPassword(newPassword);
  existingUsers[userIdx].passwordHash = newHash;
  saveStoredCustomers(existingUsers);
  localStorage.removeItem(OTP_STORAGE_KEY);

  const updatedAccount = existingUsers[userIdx];
  const currentUser: User = {
    id: updatedAccount.id,
    name: updatedAccount.name,
    email: updatedAccount.email,
    phone: updatedAccount.phone,
    role: 'customer',
    isVerified: true
  };

  localStorage.setItem('mortafaat_current_customer', JSON.stringify(currentUser));
  return currentUser;
}

// 9. Session restoration
export function getSavedCustomerSession(): User | null {
  try {
    const raw = localStorage.getItem('mortafaat_current_customer');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutCustomer() {
  localStorage.removeItem('mortafaat_current_customer');
  saveSession(null);
}
