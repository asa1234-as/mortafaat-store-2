# دليل تحويل المتجر إلى تطبيق هاتف (PWA + Capacitor Android & iOS)
## متجر مرتفعات ستور | Mortafaat Store

يوفر متجر مرتفعات ستور خيارين لتشغيل المتجر كتطبيق هاتف ذكي:
1. **تطبيق ويب تقدمي (PWA)** قابل للتثبيت الفوري مباشرة من المتصفح دون الحاجة لمتاجر التطبيقات.
2. **تطبيق محلي مدمج (Native Hybrid App)** باستخدام Capacitor لنظامي Android و iOS.

---

## أولاً: تطبيق الويب التقدمي (PWA) - جاهز ومفعّل فوراً

المتجر مزود بملفات PWA القياسية:
- `public/manifest.json`: معرّف باسم "مرتفعات ستور | Mortafaat Store"، أيقونات بأبعاد 192x192 و 512x512، ودعم الألوان الذهبية والداكنة.
- `public/sw.js`: Service Worker للتخزين المؤقت لملفات التطبيق الأساسية (App Shell) والعمل السريع بدون اتصال بالإنترنت.
- `index.html`: ترويسات متوافقة مع متصفحات Chrome و Safari لنظام iOS (`apple-touch-icon` و `mobile-web-app-capable`).

### طريقة التثبيت للعملاء:
- **على هواتف Android (Chrome):** عند فتح رابط المتجر، سيظهر شريط منبثق في الأسفل: "إضافة مرتفعات ستور إلى الشاشة الرئيسية" (Install App).
- **على هواتف iPhone (Safari):** يضغط العميل على زر المشاركة (Share Icon) ثم يختار "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).

---

## ثانياً: بناء تطبيق Capacitor لأنظمة Android و iOS

ملف الإعداد `capacitor.config.ts` مجهز بالمعرفات الرسمية:
- **App ID:** `com.mortafaat.store`
- **App Name:** `Mortafaat Store`
- **Web Dir:** `dist`

### متطلبات التطوير:
- **لنظام Android:** جهاز كمبيوتر مثبت عليه Node.js و [Android Studio](https://developer.android.com/studio) مع Android SDK.
- **لنظام iOS:** يتطلب **حصرياً** جهاز كمبيوتر يعمل بنظام **macOS** ومثبت عليه برنامج **Xcode** وحساب مطور لدى Apple (Apple Developer Account). لا يمكن توليد أو توقيع حزمة iOS (`.ipa`) على أنظمة Windows بدون بيئة macOS.

---

### خطوات التجهيز والبناء:

#### 1. تثبيت حزم Capacitor
في بيئة التطوير الخاصة بك مع توفر اتصال بالإنترنت، نفّذ الأوامر التالية:
```bash
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android @capacitor/ios
```

#### 2. بناء ملفات المتجر المحدثة
```bash
npm run build
```

#### 3. إضافة منصتي Android و iOS
```bash
npx cap add android
npx cap add ios
```

#### 4. مزامنة التغييرات دورياً
كلما قمت بتعديل كود الواجهة وأعدت البناء (`npm run build`)، نفذ:
```bash
npx cap sync
```

---

### فتح وبناء تطبيق Android:
1. افتح المشروع داخل Android Studio عبر الأمر:
```bash
npx cap open android
```
2. انتظر حتى يكتمل تحميل Gradle ومزامنة الحزم.
3. لتجربة التطبيق: اختر محاكي (Emulator) أو صل هاتفك عبر USB واضغط **Run**.
4. لتوليد حزمة الإطلاق للمتجر (Google Play):
   - من القائمة العلوية في Android Studio: اختر **Build** > **Generate Signed Bundle / APK**.
   - اختر **Android App Bundle (.aab)** أو **APK**.
   - أنشئ مفتاح التوقيع (Keystore) وحدد كلمة المرور.
   - اختر وضع البناء **release**.
   - ستحصل على ملف جاهز للرفع على Google Play Console.

---

### فتح وبناء تطبيق iOS (على نظام macOS فقط):
1. افتح المشروع داخل Xcode عبر الأمر:
```bash
npx cap open ios
```
2. في Xcode، اختر المشروع في اللوحة الجانبية، ومن تبويب **Signing & Capabilities**:
   - اختر حسابك في **Team**.
   - حدد الـ Bundle Identifier (`com.mortafaat.store`).
3. اختر جهاز الاختبار أو المحاكي واضغط **Run**.
4. للإطلاق على App Store: اختر **Product** > **Archive** واتبع معالج الرفع إلى TestFlight أو App Store Connect.
