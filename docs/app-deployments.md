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

### الخطوات الآمنة الأقل صلاحية

1. من Cloudflare افتح **Workers & Pages** وأنشئ Worker فارغًا باسم `mortafaat-store-admin` (قالب Hello World يكفي) حتى يصبح موجودًا قبل إصدار صلاحية النشر.
2. افتح **Manage Account → Account API Tokens → Create Token**.
3. أنشئ Token بصلاحية **Workers Editor**، وقيّده بالـWorkerين الموجودين فقط:
   - `mortafaat-store-2new`
   - `mortafaat-store-admin`
4. لا تضف صلاحيات R2 منفصلة لمجرد ربط الـBucket بالـWorker؛ صلاحية تعديل الـWorker تكفي لنشر binding موجود. صلاحيات R2 S3 المنفصلة مطلوبة فقط لنسخ قواعد البيانات الاحتياطية.
5. انسخ قيمة Token مرة واحدة، ثم في GitHub افتح **Settings → Secrets and variables → Actions → New repository secret**، وسمّه `CLOUDFLARE_API_TOKEN` وضع القيمة هناك فقط. لا ترسلها في المحادثة ولا تضعها في ملفات المشروع.

إذا لم يكن Worker الإدارة قد أُنشئ مسبقًا، فإن إنشاء Worker جديد يحتاج صلاحية Workers Admin على مستوى المنتج. لذلك نفضّل إنشاء Worker الفارغ أولًا، ثم استخدام Token محدود بصلاحية Editor على هذين الـWorkerين.

إذا لم يكن السر موجودًا، يتخطى النشر بأمان ولا يوقف اختبارات المشروع. بعد إضافته، شغّل Workflow **Deploy customer and admin Workers** يدويًا من تبويب Actions.

## روابط التطبيقات بعد النشر

- العملاء: `https://mortafaat-store-2new.ahmedorabi753.workers.dev`
- الإدارة: `https://mortafaat-store-admin.ahmedorabi753.workers.dev`

بعد نجاح أول نشر للإدارة، يجب إضافة رابط الإدارة إلى **Supabase → Authentication → URL Configuration → Redirect URLs**، مع السماح بمساراته، قبل اختبار استعادة كلمة مرور المدير من النطاق الجديد.
