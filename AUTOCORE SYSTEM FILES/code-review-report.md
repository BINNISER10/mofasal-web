# التقرير الفني الشامل لمراجعة الكود البرمجي (MOFASAL Code Review)
**تاريخ المراجعة:** 1 يونيو 2026  
**إعداد:** خبير الأنظمة والذكاء الاصطناعي (CTO Agent)  
**المشروع:** منصة مفصل للتفصيل وسوق الأقمشة (Premium Tailoring & Fabric Marketplace Monorepo)  
**الحساب المرتبط:** itbinniser@gmail.com

---

## 1. هيكل المشروع ونظام Monorepo
يستخدم المشروع نظام Monorepo الموحد لربط الواجهات بالخادم، مقسماً كالتالي:
* **تطبيقات الواجهة:**
  * [apps/web](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/apps/web): تطبيق الويب المتكامل المبني بإطار العمل **Next.js 14** (App Router).
  * [apps/mobile](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/apps/mobile): تطبيق الجوال المبني بـ **React Native** والموجه للعملاء والمناديب الميدانيين.
* **الخدمات الخلفية:**
  * [services/api](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/services/api): خادم الـ API الرئيسي المبني بـ **Express.js** و **Prisma ORM**.
  * [services/reports-py](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/services/reports-py): خدمة مصغرة (Microservice) بلغة **Python / FastAPI** لإنشاء وتصدير التقارير المحاسبية والبيانية المعقدة.
* **الحزم المشتركة:**
  * [packages/shared](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/packages/shared): تحتوي على الأنواع (Types) والمقاييس المشتركة لضمان اتساق البيانات وتفادي الازدواجية.

---

## 2. مراجعة قاعدة البيانات والـ Schema
الملف الأساسي للنمذجة هو [schema.prisma](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/services/api/prisma/schema.prisma):
* **الهيكلية وتوزيع الجداول:**
  * يحتوي الملف على تصميم شامل ومحكم للغاية لقواعد البيانات يغطي دورة حياة الطلبات بأكملها، بالإضافة إلى المحاسبة والمخازن وإدارة الموظفين والذكاء الاصطناعي.
* **التحجيم والأداء (Scalability):**
  * تم وضع فهارس مخصصة (`@@index`) على الأعمدة المستعلم عنها بشكل دائم مثل `shopId` و `customerId` و `status` و `email` و `phone` لضمان أداء مستقر وسرعة بحث فائقة مع قاعدة بيانات تنمو لأكثر من **200 ألف مستخدم نشط**.
  * تدعم إعدادات قاعدة البيانات ربط **PgBouncer** لموازنة الاتصالات المتزامنة.

---

## 3. مراجعة الخادم الخلفي (Express.js Backend)

### 3.1 إدارة الطلبات ودورة الحياة
تتم إدارة العمليات عبر الكلاس [OrderService](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/services/api/src/services/OrderService.ts):
* **توليد الأرقام المرجعية:** يتم توليد أرقام فريدة غير قابلة للتنبؤ مع إضافات عشوائية باستخدام `nanoid` (مثل `MUF-TIMESTAMP-RANDOM`).
* **التحكم بالتدفق (Status Flow Guard):** مصفوفة `STATUS_FLOW` تفرض مساراً صارماً لحالة الطلبات (من `PENDING` إلى `CONFIRMED` إلى `IN_PROGRESS` إلخ) وتمنع الحالات العشوائية.
* **الربط اللحظي:** يرسل الخادم إشعارات فورية عبر [NotificationService](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/services/api/src/services/NotificationService.ts) عند كل انتقال لحالة الطلب.

### 3.2 النظام المحاسبي المزدوج (Double-Entry Bookkeeping)
يتم تشغيله عبر الكلاس [LedgerService](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/services/api/src/services/LedgerService.ts):
* **تأمين القيود المتوازنة:** دالة `postEntry` تقوم بالتحقق من توازن مبالغ المدين (Debit) والدائن (Credit) وعزل أي عملية غير متوازنة، ويتم التحديث عبر Prisma Transactions المحمية لضمان سلامة العمليات المالية (Atomicity).
* **الأتمتة المحاسبية:** عند اكتمال الطلب ودفع قيمته، تقوم دالة `postOrderRevenue` بترحيل القيود تلقائياً لحسابات المبيعات والضرائب المستحقة وصندوق النقد/البنك.

---

## 4. الفوترة الإلكترونية والربط مع هيئة الزكاة والضريبة والجمارك (ZATCA)
تتم المعالجة داخل مجلد [services/zATCA](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/services/api/src/services/zATCA):
* **توليد ملفات XML:** يقوم الكلاس [InvoiceXmlGenerator](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/services/api/src/services/zATCA/InvoiceXmlGenerator.ts) ببناء الفاتورة الضريبية وفاتورة التصدير المبسطة وفقاً للمعيار القياسي UBL 2.1 المعتمد من الهيئة.
* **تشفير وتوليد QR (TLV Tags):** تقوم دالة `generateQrCodeData` بتحويل بيانات البائع والرقم الضريبي والوقت وقيمة الضريبة الإجمالية وتشفيرها بنمط TLV الثنائي ومن ثم تحويلها لـ Base64 لتمثيلها برمز QR صالح ومعتمد عند المسح.
* **الربط والتوقيع الرقمي:** يدير الكلاس [ZatcaApiService](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/services/api/src/services/zATCA/ZatcaApiService.ts) عمليات الإرسال والاعتماد والتوقيع الرقمي باستخدام تشفير SHA256 والمفاتيح الخاصة والشهادات الأمنية الصادرة من الهيئة.

---

## 5. محرك الذكاء الاصطناعي والتوصيات السلوكية
* **نمط المصنع اللامركزي (AI Agnostic Factory):**
  * يقوم الكلاس [AIFactory](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/services/api/src/services/ai/ai.factory.ts) بتخريج كائن التخاطب الذكي بناءً على الخيار المحدد للمحل (Gemini أو OpenAI أو DeepSeek) لضمان استقلالية كاملة وعدم الارتباط بمزود خدمة واحد.
* **جدولة BullMQ لمنع انهيار الخادم الخلفي:**
  * العمليات الثقيلة لتحليل سلوك العميل وتوليد التوصيات والـ Insights تتم خلف الكواليس عبر BullMQ و Redis بعيداً عن الخيط الأساسي (Main Thread).
* **محرك التوصيات الهجين:**
  * الكلاس [RecommendationService](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/services/api/src/services/RecommendationService.ts) يقدم خوارزمية توصيات تحسب درجات الملاءمة للمنتجات والمتاجر للعميل بناءً على فئات اهتمامه وسجل تصفحه مع إضافة قوة تعزيز الحداثة (Recency Boost) وتقييمات المتاجر.

---

## 6. تطبيق الجوال (React Native App)
* **معالج المقاسات التفاعلي ([MeasurementWizardScreen.tsx](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/apps/mobile/src/screens/customer/MeasurementWizardScreen.tsx)):**
  * معالج تفاعلي ضخم يحتوي على فلاتر وتحققات صارمة من صحة المقاسات المدخلة للتأكد من أنها تقع ضمن الحدود الطبية والجسدية المنطقية (مثال: حقل مقاس الصدر يجب أن يكون بين 40 و 150 سم) لتجنب أخطاء التفصيل الكارثية.
  * يتيح تحديد خيارات التفصيل الدقيقة للثوب الخليجي التقليدي (كولار، كبك، أزرار، خياطة) ومصدر القماش.
* **ربط API سلس:**
  * نظام Axios Interceptors يدير تجديد توثيق التوكن (Token Refresh Interceptor) وحفظه في مساحة الجوال المشفرة، مع تراجع ذكي للبيانات الوهمية عند تعطل الاتصال بالخادم.

---

## 7. تطبيق الويب Next.js ونظام التصميم وحل مشكلة الترطيب
* **التصميم المتميز 2026:**
  * واجهة تدعم RTL بالكامل ولغات متعددة مع تدرجات لونية خليجية فاخرة (الوقار الداكن، الذهبي، والعنابي) وتصميم يدعم الوضعين الداكن والفاتح بسلاسة.
* **حل مشكلة عدم تطابق الترطيب (Hydration Mismatch):**
  * تم تصحيح تداخلات وسوم HTML غير القانونية في [Footer.tsx](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/apps/web/src/components/shared/Footer.tsx) (عبر تحويل أزرار التحميل الحاوية لعناصر كتلة إلى روابط `<a>` و `<span>`) وتعديل مكون [Avatar.tsx](file:///g:/My%20Drive/OPEN%20CODE/MOFASAL/apps/web/src/components/ui/Avatar.tsx) إلى `span` لمنع حدوث تعارض بالترطيب عند وضعه داخل أزرار الهيدر والسايدبار.
  * تضمن هذه التعديلات عدم ظهور أي خطأ بالترطيب في متصفحات العملاء.

---

## 8. الفجوات الحالية والتوصيات للإنتاج الفعلي
1. **خرائط جوجل والتتبع الجغرافي للمناديب:**
   * الواجهات مجهزة، لكنها تعتمد حالياً على إحداثيات ثابتة لعدم تفعيل Google Maps API Keys. يجب تكوين المفاتيح في ملفات البيئة للإنتاج.
2. **استبدال رمز OTP الافتراضي:**
   * للتسهيل في بيئة التطوير، يتم قبول الرمز الافتراضي `1234` في الواجهات. يجب ربط `SmsService` برمز عشوائي فوري عبر Twilio عند الانتقال للإنتاج الفعلي لحماية أمن المستخدمين.
3. **توسيع شاشات الجوال للمتاجر والتجار:**
   * تطبيق الجوال الحالي يركز بشكل كامل على شاشات العميل والمندوب، ويحتوي على هياكل للمتاجر والتجار. يجب استكمال ربط شاشاتهم الإدارية والتنبيهات المباشرة.

---
**تقرير مصدق من قبل CTO لـ AUTOCORE SYSTEM.**
