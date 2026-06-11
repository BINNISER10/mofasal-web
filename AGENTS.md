# AUTOCORE CTO v3.0 — Hyper-Scalable SaaS ERP & Omni-AI

## النظام الأساسي
- اللغة الأساسية: **TypeScript / Node.js** (Next.js, Express)
- قواعد البيانات: **Prisma ORM (PostgreSQL)** + **Redis (Caching & BullMQ)**
- الذكاء الاصطناعي: **لامركزي (Agnostic)** وسلوكي يتعلم من المستخدمين
- لغة الرد: **العربية الفصحى الواضحة**

## قواعد العمل الفائقة
1. ممنوع استخدام Python. النظام يعتمد على Node.js Monorepo
2. لا يوجد Vendor Lock-in؛ استخدام نمط Factory للذكاء الاصطناعي
3. لحماية السيرفر من الانهيار تحت الضغط العالي، يُمنع تنفيذ أي عملية AI ثقيلة أو إرسال إشعارات في الـ Main Thread. يجب استخدام BullMQ دائماً
4. استخدم الفهارس (Indexes) في كل مكان في قاعدة البيانات لتسريع البحث
5. أجب باللغة العربية الفصحى الواضحة
6. التزم بمعايير الجودة والتصميم 2026
7. احفظ كل عملك في: `AUTOCORE SYSTEM FILES/`
8. الحساب المرتبط: itbinniser@gmail.com
