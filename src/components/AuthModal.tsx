import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Mail, Phone, Lock, CheckCircle2, KeyRound, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser, setCurrentUser } = useStore();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password' | 'otp-verify'>('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('4829');
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = (destination: string) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpNotice(`تم إرسال رمز التحقق OTP (${code}) إلى ${destination}`);
    setAuthMode('otp-verify');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone || !name) return;
    handleSendOtp(emailOrPhone);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone || !password) return;
    setCurrentUser({
      id: `usr-${Date.now()}`,
      name: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'عميل مرتفعات',
      email: emailOrPhone.includes('@') ? emailOrPhone : 'customer@mortafaat.store',
      phone: emailOrPhone.includes('@') ? '01067906474' : emailOrPhone,
      isVerified: true
    });
    setIsAuthModalOpen(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === generatedOtp || otpInput === '1234') {
      if (authMode === 'otp-verify' && newPassword) {
        // Password reset flow
        alert('تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.');
        setAuthMode('login');
        setNewPassword('');
        setOtpInput('');
        return;
      }

      // Successful Registration
      setCurrentUser({
        id: `usr-${Date.now()}`,
        name: name || 'عميل مرتفعات الجديد',
        email: emailOrPhone.includes('@') ? emailOrPhone : 'user@mortafaat.store',
        phone: emailOrPhone.includes('@') ? '01067906474' : emailOrPhone,
        isVerified: true
      });
      setIsAuthModalOpen(false);
    } else {
      alert('رمز التحقق غير صحيح، برجاء المحاولة مجدداً');
    }
  };

  const handleGoogleLogin = () => {
    setCurrentUser({
      id: `usr-google-${Date.now()}`,
      name: 'عميل جوجل الموثق',
      email: 'customer.google@gmail.com',
      phone: '01067906474',
      isVerified: true
    });
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-gold/40 my-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-gold text-brand-black flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-black text-sm text-gray-900">
              {authMode === 'login' ? 'تسجيل الدخول إلى حسابك' : 
               authMode === 'register' ? 'إنشاء حساب جديد في المتجر' :
               authMode === 'forgot-password' ? 'استعادة كلمة المرور' : 'تأكيد رمز التحقق (OTP)'}
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
              <label className="font-bold text-gray-700 block mb-1">البريد الإلكتروني أو رقم الهاتف *</label>
              <input
                type="text"
                required
                placeholder="example@gmail.com أو 010..."
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-gray-700">كلمة المرور *</label>
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot-password')}
                  className="text-[11px] text-brand-goldDark font-bold hover:underline"
                >
                  هل نسيت كلمة المرور؟
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
              className="w-full py-2.5 rounded-xl bg-brand-black text-brand-gold font-black text-xs hover:bg-brand-gold hover:text-black transition-colors shadow-md"
            >
              تسجيل الدخول
            </button>

            {/* Google Social Login */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2 rounded-xl border border-gray-300 hover:bg-gray-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors text-gray-700"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>المتابعة باستخدام حساب Google</span>
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 pt-2">
              ليس لديك حساب بعد؟{' '}
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-brand-goldDark font-bold hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </p>
          </form>
        )}

        {/* 2. REGISTER VIEW */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">الاسم بالكامل *</label>
              <input
                type="text"
                required
                placeholder="مثال: أحمد محمود"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">البريد الإلكتروني أو رقم الهاتف *</label>
              <input
                type="text"
                required
                placeholder="سيصلك رمز تحقق OTP لتفعيل الحساب"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gold-gradient text-brand-black font-black text-xs hover:brightness-105 shadow-md"
            >
              إرسال رمز التحقق (OTP)
            </button>

            <p className="text-center text-xs text-gray-500 pt-2">
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-brand-goldDark font-bold hover:underline"
              >
                تسجيل الدخول
              </button>
            </p>
          </form>
        )}

        {/* 3. FORGOT PASSWORD VIEW */}
        {authMode === 'forgot-password' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(emailOrPhone); }} className="space-y-3.5 text-xs">
            <p className="text-gray-600 leading-relaxed text-[11px]">
              أدخل بريدك الإلكتروني أو رقم هاتفك وسنرسل لك رمز تحقق (OTP) لإنشاء كلمة مرور جديدة:
            </p>

            <div>
              <label className="font-bold text-gray-700 block mb-1">البريد أو رقم الهاتف *</label>
              <input
                type="text"
                required
                placeholder="أدخل بريدك المسجل..."
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">كلمة المرور الجديدة المرغوبة *</label>
              <input
                type="password"
                required
                placeholder="أدخل كلمة المرور الجديدة"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand-black text-white font-bold text-xs hover:bg-brand-gold hover:text-black"
            >
              إرسال رمز التحقق
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="text-gray-500 text-xs text-center block w-full hover:underline pt-1"
            >
              العودة لتسجيل الدخول
            </button>
          </form>
        )}

        {/* 4. OTP VERIFICATION VIEW */}
        {authMode === 'otp-verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-3.5 text-xs text-center">
            <div className="w-12 h-12 bg-amber-100 text-brand-goldDark rounded-full flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900">أدخل رمز التحقق (OTP)</h4>
              {otpNotice && (
                <p className="text-[11px] text-emerald-700 font-bold mt-1 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  {otpNotice}
                </p>
              )}
            </div>

            <div>
              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                placeholder="• • • •"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-40 mx-auto px-4 py-2.5 rounded-xl border-2 border-brand-gold font-mono text-center text-xl tracking-widest font-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gold-gradient text-brand-black font-black text-xs hover:brightness-105 shadow-md"
            >
              تأكيد الدخول وتفعيل الحساب
            </button>

            <button
              type="button"
              onClick={() => handleSendOtp(emailOrPhone)}
              className="text-[11px] text-gray-500 hover:text-black block mx-auto underline"
            >
              إعادة إرسال الرمز
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
