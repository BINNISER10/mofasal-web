# حزمة المستثمر + مذكرة التفاهم — 2026-06-14

## ما تم إنجازه

1. **مذكرة التفاهم بقالب البرند** — صفحة RTL بألوان الهوية (`#00373E`, `#D4A017`, `#F2E8D4`)
2. **3 لقطات جمالية** داخل المذكرة (الرئيسية، لوحة الإدارة، معالج الطلب)
3. **حزمة مستثمر موحّدة** — ZIP خفيف (~458 KB) بدل إرسال المذكرة وحدها
4. **نشر حي** — commit `d9c33be`

## الروابط

| المورد | الرابط |
|--------|--------|
| حزمة المستثمر | https://mofasal.netlify.app/investor |
| مذكرة التفاهم (عرض + طباعة PDF) | https://mofasal.netlify.app/investor/mou |
| حزمة ZIP كاملة | `/investor/MOFASAL-Investor-Package.zip` |
| لقطات PDF | `/investor/MOFASAL-Investor-Deck.pdf` |

## توصية الخبير

**لا تُرسل مذكرة التفاهم وحدها للمستثمر.**

الترتيب الأمثل:
1. **الاجتماع:** اعرض الموقع الحي `mofasal.netlify.app` (5 دقائق)
2. **بعد الاجتماع:** أرسل **الحزمة الكاملة ZIP** — تشمل PDF اللقطات + نص المذكرة + رابط العرض الرسمي
3. **التوقيع:** استخدم صفحة `/investor/mou` → «طباعة / حفظ PDF» للنسخة الموقّعة

## الملفات

- `apps/web/src/data/mouContent.ts` — محتوى المذكرة
- `apps/web/src/app/investor/mou/page.tsx` — صفحة العرض
- `apps/web/src/app/investor/page.tsx` — مركز التحميل
- `apps/web/public/investor/screenshots/` — 10 لقطات

## المصدر الأصلي

`G:\My Drive\SER-AI\مشروع مفصل\مذكرة تفاهم.docx`
