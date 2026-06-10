/** صور الصفحة الرئيسية — Unsplash (تعمل على Render بدون رفع ملفات) */
const U = 'https://images.unsplash.com';

export const HOME_IMAGES = {
  hero: `${U}/photo-1594938298603-c8148c4dae35?w=1920&q=80`,
  heroSlides: [
    `${U}/photo-1594938298603-c8148c4dae35?w=1920&q=80`,
    `${U}/photo-1624378515194-6bb30582bedf?w=1920&q=80`,
    `${U}/photo-1558171813-4c088753af8f?w=1920&q=80`,
  ],
  tailoring: `${U}/photo-1558171813-4c088753af8f?w=1200&q=80`,
  fabric: `${U}/photo-1624378515194-6bb30582bedf?w=1200&q=80`,
  craftsmanship: `${U}/photo-1594938298603-c8148c4dae35?w=1200&q=80`,
  whiteFabric: `${U}/photo-1594938298603-c8148c4dae35?w=800&q=80`,
  products: [
    `${U}/photo-1594938298603-c8148c4dae35?w=600&q=80`,
    `${U}/photo-1624378515194-6bb30582bedf?w=600&q=80`,
    `${U}/photo-1558171813-4c088753af8f?w=600&q=80`,
    `${U}/photo-1594938298603-c8148c4dae35?w=600&q=80`,
  ],
} as const;
