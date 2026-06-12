'use client';

import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useAppStore } from '@/lib/stores/appStore';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeStats } from '@/components/home/HomeStats';
import { HomeCategories } from '@/components/home/HomeCategories';
import { HomeCraftsmanship } from '@/components/home/HomeCraftsmanship';
import { HomeLookbook } from '@/components/home/HomeLookbook';
import { HomeSteps } from '@/components/home/HomeSteps';
import { HomeFeatures } from '@/components/home/HomeFeatures';
import { HomeTrust } from '@/components/home/HomeTrust';
import { HomeCities } from '@/components/home/HomeCities';
import { HomeTestimonials } from '@/components/home/HomeTestimonials';
import { HomeCta } from '@/components/home/HomeCta';
import { HomeAppDownload } from '@/components/home/HomeAppDownload';

export default function HomePage() {
  const { isRTL } = useAppStore();

  return (
    <div className="min-h-screen">
      <Navbar />
      <HomeHero isRTL={isRTL} />
      <HomeStats isRTL={isRTL} />
      <HomeCategories isRTL={isRTL} />
      <HomeCraftsmanship isRTL={isRTL} />
      <HomeLookbook isRTL={isRTL} />
      <HomeSteps isRTL={isRTL} />
      <HomeFeatures isRTL={isRTL} />
      <HomeTrust isRTL={isRTL} />
      <HomeCities isRTL={isRTL} />
      <HomeTestimonials isRTL={isRTL} />
      <HomeCta isRTL={isRTL} />
      <HomeAppDownload isRTL={isRTL} />
      <Footer />
    </div>
  );
}
