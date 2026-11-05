# دليل استضافة ونشر المتجر على Cloudflare Pages مجاناً
## متجر مرتفعات ستور | Mortafaat Store

يوفر هذا الدليل شرحًا كاملاً لنشر متجر مرتفعات ستور على استضافة Cloudflare Pages العالمية فائقة السرعة والمجانية بالكامل، مع ربطه بمستودع GitHub وتفعيل النشر الآلي (CI/CD).

---

### 1. المتطلبات الأولية
- حساب مجاني على [GitHub](https://github.com).
- حساب مجاني على [Cloudflare](https://dash.cloudflare.com).
- تجهيز متغيري البيئة `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` من مشروع Supabase الخاص بك.

---

### 2. رفع المشروع إلى GitHub
1. في مجلد المشروع، تأكد من تهيئة مستودع Git:
```bash
git init
git add .
git commit -m "feat: complete production ready mortafaat store"
git branch -M main
```
2. أنشئ مستودعًا جديدًا على حسابك في GitHub باسم: `mortafaat-store` (اجعله Private أو Public).
3. اربط المستودع وادفع الكود:
```bash
git remote add origin https://github.com/YOUR_USERNAME/mortafaat-store.git
git push -u origin main
```
> ⚠️ **ملاحظة أمنية:** ملف `.gitignore` معد مسبقاً لمنع رفع أي ملفات سرية أو `.env.local` نهائياً.

---

### 3. إعداد النشر على Cloudflare Pages
1. ادخل إلى لوحة تحكم Cloudflare: [https://dash.cloudflare.com](https://dash.cloudflare.com).
2. من القائمة الجانبية، اختر **Workers & Pages**.
3. اضغط على **Create application** ثم اختر تبويب **Pages**.
4. اضغط على **Connect to Git** وسجل الدخول بحساب GitHub الخاص بك، ثم اختر مستودع `mortafaat-store`.
5. اضغط على **Begin setup**.

---

### 4. ضبط إعدادات البناء (Build Configuration)
املأ الحقول بدقة كالتالي:
- **Project name:** `mortafaat-store` (أو أي اسم تفضله).
- **Production branch:** `main`.
- **Framework preset:** `Vite`.
- **Build command:** `npm run build`.
- **Build output directory:** `dist`.
- **Root directory:** اتركه فارغاً `/`.

---

### 5. إضافة متغيرات البيئة (Environment Variables)
في نفس صفحة الإعداد، اضغط على **Environment variables (advanced)** وأضف المتغيرين التاليين:
1. `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
2. `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`

> 💡 اضغط على خيار تطبيق هذه المتغيرات على بيئتي **Production** و **Preview**.

---

### 6. إطلاق الموقع والتحقق
1. اضغط على **Save and Deploy**.
2. سيبدأ Cloudflare في تحميل الحزم، وتشغيل الاختبارات، وبناء المشروع.
3. خلال أقل من دقيقة، سيكتمل النشر وستحصل على رابط مجاني فائق السرعة محمي بشهادة SSL تلقائية مثل:
   `https://mortafaat-store.pages.dev`
4. ملف `public/_redirects` يقوم تلقائياً بضبط توجيهات الـ SPA بحيث تعمل أي صفحة ومسار بدون خطأ 404.
5. ملف `public/_headers` يضيف ترويسات الأمان لمنع هجمات Clickjacking والتنصت.

---

### 7. ربط دومين مخصص (Custom Domain) مجاناً
إذا كان لديك نطاق خاص (مثل `mortafaat.com`):
1. من صفحة مشروعك في Cloudflare Pages، اذهب إلى تبويب **Custom domains**.
2. اضغط على **Set up a custom domain**.
3. اكتب اسم الدومين الخاص بك واتبع الخطوات البسيطة لربط سجلات الـ DNS تلقائياً مجاناً مع توفير شهادة SSL مجانية مدى الحياة.
