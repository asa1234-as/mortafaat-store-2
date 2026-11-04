import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Lock } from 'lucide-react';

import { t } from '../i18n';
import { signInWithEmail, signUpWithEmail, requestPasswordReset } from '../lib/supabase';
export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setCurrentUser } = useStore();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.includes('@') || !password || !name) {
      setAuthError(t("استخدم بريدًا إلكترونيًا صحيحًا وكلمة مرور واسمًا."));
      return;
    }
    setIsSubmitting(true); setAuthError(null);
    try {
      const result = await signUpWithEmail(emailOrPhone, password, { full_name: name });
      if (result.user && result.access_token) {
        setCurrentUser({ id: result.user.id, name, email: emailOrPhone, phone: '', isVerified: true });
        setIsAuthModalOpen(false);
      } else {
        setAuthError(t("تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيده ثم سجّل الدخول."));
        setAuthMode('login');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t("تعذّر إنشاء الحساب."));
    } finally { setIsSubmitting(false); }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.includes('@') || !password) {
      setAuthError(t("تسجيل الدخول يتطلب البريد الإلكتروني وكلمة المرور."));
      return;
    }
    setIsSubmitting(true); setAuthError(null);
    try {
      const user = await signInWithEmail(emailOrPhone, password);
      setCurrentUser({
        id: user.id,
        name: String(user.user_metadata?.full_name || user.email?.split('@')[0] || ''),
        email: user.email || emailOrPhone,
        phone: String(user.phone || ''),
        isVerified: Boolean(user.email_confirmed_at)
      });
      setIsAuthModalOpen(false);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t("بيانات الدخول غير صحيحة."));
    } finally { setIsSubmitting(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setAuthError(null);
    try {
      await requestPasswordReset(emailOrPhone);
      setAuthError(t("إذا كان البريد مسجلًا، فسيصلك رابط استعادة كلمة المرور."));
      setAuthMode('login');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t("تعذّر إرسال رابط الاستعادة."));
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-gold/40 my-6 space-y-4">
        
        {/* Header */}
        {authError && <p role="alert" className="text-xs text-red-600 bg-red-50 rounded-xl p-3">{authError}</p>}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-gold text-brand-black flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-black text-sm text-gray-900">
              {authMode === 'login' ? t("تسجيل الدخول إلى حسابك") : 
               authMode === 'register' ? t("إنشاء حساب جديد في المتجر") :
               authMode === 'forgot-password' ? t("استعادة كلمة المرور") : t("تسجيل الدخول")}
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. LOGIN VIEW */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">{t("البريد الإلكتروني *")}</label>
              <input
                type="text"
                required
                placeholder={t("example@gmail.com")}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-gray-700">{t("كلمة المرور *")}</label>
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot-password')}
                  className="text-[11px] text-brand-goldDark font-bold hover:underline"
                >
                  {t("هل نسيت كلمة المرور؟")}
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-brand-black text-brand-gold font-black text-xs hover:bg-brand-gold hover:text-black transition-colors shadow-md"
            >
              {t("تسجيل الدخول")}
            </button>

            <p className="text-center text-xs text-gray-500 pt-2">
              {t("ليس لديك حساب بعد؟")}{' '}
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-brand-goldDark font-bold hover:underline"
              >
                {t("إنشاء حساب جديد")}
              </button>
            </p>
          </form>
        )}

        {/* 2. REGISTER VIEW */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">{t("الاسم بالكامل *")}</label>
              <input
                type="text"
                required
                placeholder={t("مثال: أحمد محمود")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">{t("البريد الإلكتروني *")}</label>
              <input
                type="text"
                required
                placeholder={t("أدخل بريدك الإلكتروني لإنشاء حساب آمن")}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">{t("كلمة المرور *")}</label>
              <input
                type="password"
                minLength={8}
                required
                placeholder={t("ثمانية أحرف على الأقل")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gold-gradient text-brand-black font-black text-xs hover:brightness-105 shadow-md"
            >
              {t("إنشاء الحساب")}
            </button>

            <p className="text-center text-xs text-gray-500 pt-2">
              {t("لديك حساب بالفعل؟")}{' '}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-brand-goldDark font-bold hover:underline"
              >
                {t("تسجيل الدخول")}
              </button>
            </p>
          </form>
        )}

        {/* 3. FORGOT PASSWORD VIEW */}
        {authMode === 'forgot-password' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
            <p className="text-gray-600 leading-relaxed text-[11px]">
              {t("أدخل بريدك الإلكتروني وسنرسل لك رابطًا آمنًا لاستعادة كلمة المرور:")}
            </p>

            <div>
              <label className="font-bold text-gray-700 block mb-1">{t("البريد أو رقم الهاتف *")}</label>
              <input
                type="text"
                required
                placeholder={t("أدخل بريدك المسجل...")}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
              />
            </div>


            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-brand-black text-white font-bold text-xs hover:bg-brand-gold hover:text-black"
            >
              {t("إرسال رابط الاستعادة")}
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="text-gray-500 text-xs text-center block w-full hover:underline pt-1"
            >
              {t("العودة لتسجيل الدخول")}
            </button>
          </form>
        )}


      </div>
    </div>
  );
};
