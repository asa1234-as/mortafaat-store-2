import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Lock, User as UserIcon, Mail, Phone, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { t } from '../i18n';
import { 
  loginCustomer, 
  registerCustomer, 
  startPasswordRecovery, 
  verifyOtpAndResetPassword,
  isCustomerSignupEnabled
} from '../lib/authService';
import {
  restorePasswordRecoverySessionFromUrl,
  updatePasswordWithRecoverySession,
  signOutSupabase
} from '../lib/supabase';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setCurrentUser } = useStore();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password' | 'verify-otp' | 'reset-password'>('login');
  
  // Form fields
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State feedback
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setAuthError(null);
    setAuthSuccess(null);
    setEmailOrPhone('');
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recoveryRequested = params.get('customerPasswordRecovery') === '1';
    const hasRecoverySession = restorePasswordRecoverySessionFromUrl();

    if (hasRecoverySession || recoveryRequested) {
      setAuthMode('reset-password');
      setIsAuthModalOpen(true);
      if (!hasRecoverySession) {
        setAuthError(t("رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا."));
      }
      params.delete('customerPasswordRecovery');
      const query = params.toString();
      window.history.replaceState({}, document.title, window.location.pathname + (query ? `?${query}` : ''));
    }
  }, [setIsAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSwitchMode = (mode: 'login' | 'register' | 'forgot-password') => {
    if (mode === 'register' && !isCustomerSignupEnabled) {
      setAuthError(t("إنشاء حسابات العملاء متوقف مؤقتًا لحين تجهيز وتأكيد خدمة البريد الإلكتروني."));
      return;
    }
    resetForm();
    setAuthMode(mode);
  };

  // 1. Customer Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const user = await loginCustomer(emailOrPhone, password);
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      resetForm();
    } catch (err: any) {
      setAuthError(err.message || t("بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Customer Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const user = await registerCustomer({
        name,
        email,
        phone,
        password
      });
      if (!user.isVerified) {
        setAuthSuccess(t("تم إنشاء الحساب بنجاح. تحقق من بريدك الإلكتروني لتأكيد الحساب قبل تسجيل الدخول."));
        return;
      }
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      resetForm();
      alert(t("تم إنشاء حسابك وتسجيل دخولك بنجاح! مرحباً بك في مرتفعات ستور."));
    } catch (err: any) {
      setAuthError(err.message || t("تعذر إنشاء الحساب، يرجى التأكد من البيانات المدخلة."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Password Recovery Request
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const redirectTo = `${window.location.origin}/?customerPasswordRecovery=1`;
      const result = await startPasswordRecovery(emailOrPhone, redirectTo);
      setAuthSuccess(result.message);
      if (result.requiresOtp) {
        setAuthMode('verify-otp');
      }
    } catch (err: any) {
      setAuthError(err.message || t("تعذر العثور على الحساب."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete a customer recovery link after returning from the email.
  const handleCustomerPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);
    if (newPassword.length < 8) {
      setAuthError(t("كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف."));
      setIsSubmitting(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError(t("تأكيد كلمة المرور غير مطابق."));
      setIsSubmitting(false);
      return;
    }
    try {
      await updatePasswordWithRecoverySession(newPassword);
      await signOutSupabase();
      setAuthMode('login');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setAuthSuccess(t("تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول."));
    } catch (err: any) {
      setAuthError(err.message || t("تعذر تحديث كلمة المرور. اطلب رابط استعادة جديدًا."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Local-development OTP fallback only.
  const handleOtpResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const user = await verifyOtpAndResetPassword(otpCode, newPassword);
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      resetForm();
      alert(t("تم تعيين كلمة المرور الجديدة وتسجيل دخولك بنجاح!"));
    } catch (err: any) {
      setAuthError(err.message || t("فشل التحقق من الرمز أو تعيين كلمة المرور."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white dark:bg-zinc-900 text-black dark:text-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border-2 border-brand-gold/40 my-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-gold text-brand-black flex items-center justify-center font-bold shadow-md">
              <Lock className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="font-black text-sm text-gray-900 dark:text-white">
                {authMode === 'login' ? t("تسجيل الدخول إلى حسابك") : 
                 authMode === 'register' ? t("إنشاء حساب عميل جديد") :
                 authMode === 'forgot-password' ? t("استعادة كلمة المرور") :
                 authMode === 'reset-password' ? t("تعيين كلمة مرور جديدة") : t("تأكيد رمز التحقق")}
              </h3>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {t("مرتفعات ستور - تجربة تسوق آمنة ومضمونة")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setIsAuthModalOpen(false); resetForm(); }}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors"
            title={t("إغلاق")}
            aria-label={t("إغلاق")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Alerts */}
        {authError && (
          <div role="alert" className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-3 font-medium">
            {authError}
          </div>
        )}

        {authSuccess && (
          <div role="status" className="text-xs text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3 font-medium">
            {authSuccess}
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                {t("البريد الإلكتروني أو رقم الهاتف *")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={t("example@gmail.com أو 010xxxxxxxx")}
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none"
                />
                <UserIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{t("كلمة المرور *")}</label>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('forgot-password')}
                  className="text-[11px] text-brand-goldDark dark:text-brand-gold font-bold hover:underline"
                >
                  {t("نسيت كلمة المرور؟")}
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none font-mono"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-brand-black text-brand-gold font-black text-xs hover:bg-brand-gold hover:text-black transition-colors shadow-md disabled:opacity-50"
            >
              {isSubmitting ? t("جاري التحقق...") : t("تسجيل الدخول")}
            </button>

            <div className="pt-2 text-center border-t border-gray-100 dark:border-zinc-800">
              {isCustomerSignupEnabled ? (
                <>
                  <span className="text-gray-500 dark:text-gray-400">{t("عميل جديد؟")}{' '}</span>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className="text-brand-goldDark dark:text-brand-gold font-bold hover:underline"
                  >
                    {t("إنشاء حساب جديد في ثوانٍ")}
                  </button>
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">{t("تسجيل حسابات العملاء الجديدة سيتاح قريبًا بعد اختبار البريد الإلكتروني.")}</span>
              )}
            </div>
          </form>
        )}

        {/* 2. REGISTRATION FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("الاسم الكامل *")}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={t("أحمد محمد")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none"
                />
                <UserIcon className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("رقم الهاتف (للتوصيل) *")}</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none font-mono"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("البريد الإلكتروني *")}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("كلمة المرور (6 أحرف فأكثر) *")}</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none font-mono"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gold-gradient text-black font-black text-xs hover:brightness-105 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? t("جاري تسجيل الحساب...") : t("تأكيد إنشاء الحساب")}
            </button>

            <div className="pt-2 text-center border-t border-gray-100 dark:border-zinc-800">
              <span className="text-gray-500 dark:text-gray-400">{t("لديك حساب بالفعل؟")}{' '}</span>
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-brand-goldDark dark:text-brand-gold font-bold hover:underline"
              >
                {t("تسجيل الدخول")}
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD (REQUEST) */}
        {authMode === 'forgot-password' && (
          <form onSubmit={handleRecoverySubmit} className="space-y-3 text-xs">
            <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
              {t("أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطًا آمنًا لتعيين كلمة مرور جديدة.")}
            </p>
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("البريد أو الهاتف المسجل *")}</label>
              <input
                type="text"
                required
                placeholder="name@gmail.com أو 010xxxxxxxx"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-black text-brand-gold font-bold text-xs hover:bg-zinc-800 transition-colors shadow-md disabled:opacity-50"
            >
              {isSubmitting ? t("جاري الإرسال...") : t("إرسال رابط الاستعادة")}
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className="w-full text-center text-gray-500 hover:text-black dark:hover:text-white text-[11px] font-bold"
            >
              {t("العودة لتسجيل الدخول")}
            </button>
          </form>
        )}

        {/* Customer recovery link: set a new password after returning from email. */}
        {authMode === 'reset-password' && (
          <form onSubmit={handleCustomerPasswordReset} className="space-y-3 text-xs">
            <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
              {t("أدخل كلمة المرور الجديدة وأكدها لإكمال استعادة حسابك.")}
            </p>
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("كلمة المرور الجديدة (8 أحرف فأكثر) *")}</label>
              <input type="password" required minLength={8} autoComplete="new-password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none font-mono" />
            </div>
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("تأكيد كلمة المرور الجديدة *")}</label>
              <input type="password" required minLength={8} autoComplete="new-password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none font-mono" />
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gold-gradient text-black font-black text-xs hover:brightness-105 transition-all shadow-md disabled:opacity-50">
              {isSubmitting ? t("جاري تحديث كلمة المرور...") : t("حفظ كلمة المرور الجديدة")}
            </button>
          </form>
        )}

        {/* Local-development OTP fallback only */}
        {authMode === 'verify-otp' && (
          <form onSubmit={handleOtpResetSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                {t("رمز التحقق (6 أرقام) *")}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono font-bold rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                {t("كلمة المرور الجديدة *")}
              </label>
              <input
                type="password"
                required
                placeholder={t("6 أحرف أو أرقام على الأقل")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-brand-gold focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gold-gradient text-black font-black text-xs hover:brightness-105 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? t("جاري الحفظ...") : t("حفظ كلمة المرور والدخول")}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
