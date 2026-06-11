export interface SaudiRegion {
  id: string;
  name: string;
  nameAr: string;
}

export interface SaudiCity {
  id: string;
  name: string;
  nameAr: string;
  regions: SaudiRegion[];
}

export const SAUDI_CITIES: SaudiCity[] = [
  {
    id: 'riyadh',
    name: 'Riyadh',
    nameAr: 'الرياض',
    regions: [
      { id: 'riyadh-city', name: 'Riyadh', nameAr: 'الرياض' },
      { id: 'diriyah', name: 'Diriyah', nameAr: 'الدرعية' },
      { id: 'al-kharj', name: 'Al Kharj', nameAr: 'الخرج' },
      { id: 'al-majmaah', name: 'Al Majmaah', nameAr: 'المجمعة' },
    ],
  },
  {
    id: 'jeddah',
    name: 'Jeddah',
    nameAr: 'جدة',
    regions: [
      { id: 'jeddah-city', name: 'Jeddah', nameAr: 'جدة' },
      { id: 'obhur', name: 'Obhur', nameAr: 'أبحر' },
    ],
  },
  {
    id: 'makkah',
    name: 'Makkah',
    nameAr: 'مكة المكرمة',
    regions: [
      { id: 'makkah-city', name: 'Makkah', nameAr: 'مكة المكرمة' },
      { id: 'aziziyah', name: 'Aziziyah', nameAr: 'العزيزية' },
    ],
  },
  {
    id: 'madinah',
    name: 'Madinah',
    nameAr: 'المدينة المنورة',
    regions: [
      { id: 'madinah-city', name: 'Madinah', nameAr: 'المدينة المنورة' },
    ],
  },
  {
    id: 'dammam',
    name: 'Dammam',
    nameAr: 'الدمام',
    regions: [
      { id: 'dammam-city', name: 'Dammam', nameAr: 'الدمام' },
    ],
  },
  {
    id: 'khobar',
    name: 'Khobar',
    nameAr: 'الخبر',
    regions: [
      { id: 'khobar-city', name: 'Khobar', nameAr: 'الخبر' },
    ],
  },
  {
    id: 'dhahran',
    name: 'Dhahran',
    nameAr: 'الظهران',
    regions: [
      { id: 'dhahran-city', name: 'Dhahran', nameAr: 'الظهران' },
    ],
  },
  {
    id: 'taif',
    name: 'Taif',
    nameAr: 'الطائف',
    regions: [
      { id: 'taif-city', name: 'Taif', nameAr: 'الطائف' },
    ],
  },
  {
    id: 'tabuk',
    name: 'Tabuk',
    nameAr: 'تبوك',
    regions: [
      { id: 'tabuk-city', name: 'Tabuk', nameAr: 'تبوك' },
    ],
  },
  {
    id: 'buraidah',
    name: 'Buraidah',
    nameAr: 'بريدة',
    regions: [
      { id: 'buraidah-city', name: 'Buraidah', nameAr: 'بريدة' },
    ],
  },
  {
    id: 'khamis-mushait',
    name: 'Khamis Mushait',
    nameAr: 'خميس مشيط',
    regions: [
      { id: 'khamis-mushait-city', name: 'Khamis Mushait', nameAr: 'خميس مشيط' },
    ],
  },
  {
    id: 'abha',
    name: 'Abha',
    nameAr: 'أبها',
    regions: [
      { id: 'abha-city', name: 'Abha', nameAr: 'أبها' },
    ],
  },
  {
    id: 'najran',
    name: 'Najran',
    nameAr: 'نجران',
    regions: [
      { id: 'najran-city', name: 'Najran', nameAr: 'نجران' },
    ],
  },
  {
    id: 'hail',
    name: 'Hail',
    nameAr: 'حائل',
    regions: [
      { id: 'hail-city', name: 'Hail', nameAr: 'حائل' },
    ],
  },
  {
    id: 'jizan',
    name: 'Jizan',
    nameAr: 'جيزان',
    regions: [
      { id: 'jizan-city', name: 'Jizan', nameAr: 'جيزان' },
    ],
  },
  {
    id: 'qatif',
    name: 'Qatif',
    nameAr: 'القطيف',
    regions: [
      { id: 'qatif-city', name: 'Qatif', nameAr: 'القطيف' },
    ],
  },
  {
    id: 'jubail',
    name: 'Jubail',
    nameAr: 'الجبيل',
    regions: [
      { id: 'jubail-city', name: 'Jubail', nameAr: 'الجبيل' },
    ],
  },
  {
    id: 'yanbu',
    name: 'Yanbu',
    nameAr: 'ينبع',
    regions: [
      { id: 'yanbu-city', name: 'Yanbu', nameAr: 'ينبع' },
    ],
  },
  {
    id: 'hafr-al-batin',
    name: 'Hafr Al Batin',
    nameAr: 'حفر الباطن',
    regions: [
      { id: 'hafr-al-batin-city', name: 'Hafr Al Batin', nameAr: 'حفر الباطن' },
    ],
  },
  {
    id: 'al-ahsa',
    name: 'Al Ahsa',
    nameAr: 'الأحساء',
    regions: [
      { id: 'al-ahsa-city', name: 'Al Ahsa', nameAr: 'الأحساء' },
    ],
  },
  {
    id: 'arar',
    name: 'Arar',
    nameAr: 'عرعر',
    regions: [
      { id: 'arar-city', name: 'Arar', nameAr: 'عرعر' },
    ],
  },
  {
    id: 'sakakah',
    name: 'Sakakah',
    nameAr: 'سكاكا',
    regions: [
      { id: 'sakakah-city', name: 'Sakakah', nameAr: 'سكاكا' },
    ],
  },
  {
    id: 'al-bahah',
    name: 'Al Bahah',
    nameAr: 'الباحة',
    regions: [
      { id: 'al-bahah-city', name: 'Al Bahah', nameAr: 'الباحة' },
    ],
  },
];

export function findCity(cityName: string): SaudiCity | undefined {
  return SAUDI_CITIES.find(
    (c) => c.name === cityName || c.nameAr === cityName || c.id === cityName
  );
}
