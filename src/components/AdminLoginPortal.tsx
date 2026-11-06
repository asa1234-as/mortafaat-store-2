import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, Store } from 'lucide-react';
import { t } from '../i18n';
import { requestPasswordReset, restorePasswordRecoverySessionFromUrl, updatePasswordWithRecoverySession } from '../lib/supabase';

export const AdminLoginPortal: React.FC = () => {
  const { loginAdmin, setCurrentView } = useStore();
  const [adminEmail, setAdminEmail] = useState('ahmedorabi753@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hasRecoverySession = restorePasswordRecoverySessionFromUrl();
    const recoveryRequested = new URLSearchParams(window.location.search).get('passwordRecovery') === '1';
    if (hasRecoverySession || recoveryRequested) {
      setIsRecoveryMode(true);
      if (!hasRecoverySession) {
        setErrorMessage(t("رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رسالة استعادة جديدة."));
      }
    }
  }, []);

  const handleRequestPasswordReset = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const redirectTo = `${window.location.origin}/admin?view=admin&passwordRecovery=1`;
      await requestPasswordReset(adminEmail.trim(), redirectTo);
      setStatusMessage(t("إذا كان البريد مسجلاً، فستصلك رسالة تحتوي على رابط آمن لتعيين كلمة مرور جديدة."));
    } catch (err: any) {
      setErrorMessage(err.message || t("تعذر إرسال رسالة استعادة كلمة المرور."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    if (newPassword.length < 8) {
      setErrorMessage(t("كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف."));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage(t("تأكيد كلمة المرور غير مطابق."));
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePasswordWithRecoverySession(newPassword);
      setAdminPassword(newPassword);
      const success = await loginAdmin(adminEmail, newPassword);
      if (!success) {
        setIsRecoveryMode(false);
        setStatusMessage(t("تم تغيير كلمة المرور. يمكنك الآن تسجيل الدخول بها."));
      }
    } catch (err: any) {
      setErrorMessage(err.message || t("تعذر تحديث كلمة المرور."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const success = await loginAdmin(adminEmail, adminPassword);
      if (!success) {
        setErrorMessage(t("بيانات الدخول غير صحيحة أو ليس لديك صلاحية مدير (Admin/Owner)."));
      }
    } catch (err: any) {
      setErrorMessage(err.message || t("فشل التحقق من هوية المدير."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-center items-center p-4 selection:bg-brand-gold selection:text-black">
      <div className="max-w-md w-full bg-zinc-900 border-2 border-brand-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Portal Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-black border-2 border-brand-gold mx-auto flex items-center justify-center p-1 shadow-lg shadow-brand-gold/20">
            <img src="/logo.png" alt="" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{t("بوابة إدارة متجر مرتفعات")}</h1>
            <p className="text-xs text-brand-gold font-mono tracking-wider">MORTAFAAT ADMIN CONTROL SUITE</p>
          </div>
          <span className="inline-block text-[11px] font-bold text-gray-400 bg-black/60 px-3 py-1 rounded-full border border-zinc-800">
            {t("منطقة محمية - مصادقة قائمة على الأدوار (RBAC)")}
          </span>
        </div>

        {/* Error Feedback */}
        {statusMessage && (
          <div role="status" className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/70 rounded-xl p-3 font-medium text-center">
            {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div role="alert" className="text-xs text-red-400 bg-red-950/50 border border-red-800/80 rounded-xl p-3 font-medium text-center">
            {errorMessage}
          </div>
        )}

        {/* Password recovery form */}
        {isRecoveryMode ? (
          <form onSubmit={handlePasswordRecovery} className="space-y-4 text-xs">
            <div className="text-center">
              <h2 className="text-base font-black text-white">{t("تعيين كلمة مرور إدارية جديدة")}</h2>
              <p className="text-xs text-gray-400 mt-1">{t("أدخل كلمة المرور الجديدة ثم أكدها.")}</p>
            </div>
            <div>
              <label className="font-bold text-gray-300 block mb-1.5">{t("كلمة المرور الجديدة")}</label>
              <input type="password" required minLength={8} autoComplete="new-password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-brand-gold focus:outline-none font-mono" />
            </div>
            <div>
              <label className="font-bold text-gray-300 block mb-1.5">{t("تأكيد كلمة المرور الجديدة")}</label>
              <input type="password" required minLength={8} autoComplete="new-password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-brand-gold focus:outline-none font-mono" />
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gold-gradient text-black font-black text-xs hover:brightness-105 transition-all shadow-lg disabled:opacity-50">
              {isSubmitting ? t("جاري تحديث كلمة المرور...") : t("حفظ كلمة المرور الجديدة")}
            </button>
          </form>
        ) : (
        <>
        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-300 block mb-1.5">{t("البريد الإلكتروني للمدير / المالك:")}</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="admin@mortafaat.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-brand-gold focus:outline-none"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-300 block mb-1.5">{t("كلمة المرور الإدارية:")}</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-brand-gold focus:outline-none font-mono"
              />
              <KeyRound className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gold-gradient text-black font-black text-xs hover:brightness-105 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>{isSubmitting ? t("جاري التحقق من الصلاحيات...") : t("تسجيل الدخول إلى لوحة التحكم")}</span>
          </button>
        </form>
        <button type="button" onClick={handleRequestPasswordReset} disabled={isSubmitting || !adminEmail.trim()}
          className="w-full text-xs text-brand-gold hover:underline font-bold disabled:opacity-50">
          {isSubmitting ? t("جاري إرسال رابط الاستعادة...") : t("نسيت كلمة المرور الإدارية؟ أرسل رابط استعادة")}
        </button>
        </>
        )}

        {/* Back to Storefront Link */}
        <div className="pt-2 text-center border-t border-zinc-800">
          <button
            type="button"
            onClick={() => {
              if (window.location.hash === '#admin') window.location.hash = '';
              setCurrentView('store');
            }}
            className="text-xs text-gray-400 hover:text-brand-gold font-bold flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>{t("العودة إلى واجهة المتجر للعملاء")}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
