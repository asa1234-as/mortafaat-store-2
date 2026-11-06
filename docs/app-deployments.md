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
