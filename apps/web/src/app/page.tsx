'use client';

import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useAppStore } from '@/lib/stores/appStore';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeCategories } from '@/components/home/HomeCategories';
import { HomeLookbook } from '@/components/home/HomeLookbook';
import { HomeCraftsmanship } from '@/components/home/HomeCraftsmanship';
import { HomeSteps } from '@/components/home/HomeSteps';
import { HomeFeatures } from '@/components/home/HomeFeatures';
import { HomeTrust } from '@/components/home/HomeTrust';
import { HomeTestimonials } from '@/components/home/HomeTestimonials';
import { HomeCta } from '@/components/home/HomeCta';

export default function HomePage() {
  const { isRTL } = useAppStore();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Navbar />
      <HomeHero isRTL={isRTL} />
      <HomeCategories isRTL={isRTL} />
      <HomeLookbook isRTL={isRTL} />
      <HomeSteps isRTL={isRTL} />
      <HomeFeatures isRTL={isRTL} />
      <HomeCraftsmanship isRTL={isRTL} />
      <HomeTrust isRTL={isRTL} />
      <HomeTestimonials isRTL={isRTL} />
      <HomeCta isRTL={isRTL} />
      <Footer />
    </div>
  );
}
