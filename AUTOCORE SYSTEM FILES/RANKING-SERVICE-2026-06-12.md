# RankingService — ترتيب المحلات الذكي

**التاريخ:** 2026-06-12  
**الحالة:** مدمج في API + الويب

## ما يفعله
يُرتّب المحلات حسب درجة مركّبة:
- التقييم (40%)
- عدد الطلبات (25%)
- القرب الجغرافي (25%) — عند توفر `lat`/`lng`
- خطة الاشتراك (10%) — PREMIUM > BASIC > FREE_TRIAL

## نقاط النهاية
| Method | Path | الوصف |
|--------|------|--------|
| GET | `/api/v1/shops?sort=smart` | القائمة الافتراضية مرتّبة ذكياً |
| GET | `/api/v1/shops/ranked` | قائمة مرتّبة مع `rankingScore` |
| GET | `/api/v1/shops/:id/ranking` | تفاصيل ترتيب محل واحد |

## الويب
صفحة `/shops` تستخدم `sort=smart` افتراضياً.

## الكاش
Redis — مفتاح `shops:ranked:{hash}` لمدة 5 دقائق. عند غياب Redis يُحسب مباشرة.

## Commit
`1eff9fb` — feat: wire RankingService to shops list with smart sort
