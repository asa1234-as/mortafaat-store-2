# فصل تطبيق المتجر عن بوابة الإدارة

المشروع أصبح يملك مدخلي بناء منفصلين:

- تطبيق العملاء: `npm run build:public`، ينتج ملفات `dist/` ويستخدم `index.html` و`src/main.tsx` و`src/PublicApp.tsx` فقط.
- بوابة الإدارة: `npm run build:admin`، تنتج ملفات `dist-admin/` وتستخدم `index.admin.html` و`src/admin-main.tsx` و`src/AdminApp.tsx`.

تطبيق العملاء لا يستورد مكونات `AdminDashboard` أو `AdminLoginPortal` ولا يحتوي مسار دخول الإدارة. بوابة الإدارة مستقلة وتتحقق من دور `admin/owner` عبر Supabase قبل عرض لوحة التحكم، كما يبقى التحقق الحقيقي في سياسات RLS وWorker رفع الملفات.

## النشر

- إعداد `wrangler.jsonc` الحالي يبني تطبيق العملاء على Worker `mortafaat-store-2new`.
- إعداد `wrangler.admin.jsonc` مخصص لبوابة الإدارة على Worker منفصل `mortafaat-store-admin`، مع ربط نفس R2 وSupabase.
- نشر بوابة الإدارة يحتاج ربط إعداد Wrangler الثاني بعملية نشر مستقلة. رابطها المتوقع بعد إنشاء Worker: `https://mortafaat-store-admin.ahmedorabi753.workers.dev`.
- بعد نشرها، أضف رابطها إلى قائمة Redirect URLs في Supabase Auth حتى تعمل استعادة كلمة مرور المدير من النطاق المنفصل.

لا يتم تغيير إعدادات Supabase Redirect URLs قبل التأكد من إنشاء Worker الإدارة وتشغيله.


## إعداد النشر التلقائي

ملف `.github/workflows/deploy-cloudflare.yml` ينشر نسختي العملاء والإدارة بعد كل تحديث على `main`، بشرط وجود سر GitHub التالي:

`CLOUDFLARE_API_TOKEN`

لإنشائه:
1. من Cloudflare افتح **My Profile → API Tokens → Create Token**.
2. أنشئ Token مخصصًا للنشر، وليس Global API Key.
3. امنحه صلاحية تعديل Workers Scripts، وصلاحية قراءة/ربط R2 على الحساب الذي يحتوي Bucket `mortafaat-store-media`. اختر الحساب نفسه فقط، وقلّل الصلاحيات قدر الإمكان.
4. انسخ قيمة Token مرة واحدة.
5. في GitHub افتح **Settings → Secrets and variables → Actions → New repository secret**، وسمّه `CLOUDFLARE_API_TOKEN` وضع القيمة هناك فقط. لا ترسلها في المحادثة ولا تضعها في ملفات المشروع.

إذا لم يكن السر موجودًا، يتخطى النشر بأمان ولا يوقف اختبارات المشروع. بعد إضافته، شغّل Workflow **Deploy customer and admin Workers** يدويًا من تبويب Actions.

## روابط التطبيقات بعد النشر

- العملاء: `https://mortafaat-store-2new.ahmedorabi753.workers.dev`
- الإدارة: `https://mortafaat-store-admin.ahmedorabi753.workers.dev`

بعد نجاح أول نشر للإدارة، يجب إضافة رابط الإدارة إلى **Supabase → Authentication → URL Configuration → Redirect URLs**، مع السماح بمساراته، قبل اختبار استعادة كلمة مرور المدير من النطاق الجديد.
