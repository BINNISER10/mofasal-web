'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/stores/appStore';
import { MapPin, Clock, Star, Award, Zap, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from './RatingStars';

interface ShopCardProps {
  id: string;
  name: string;
  nameAr: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  estimatedDeliveryTime?: number;
  badges?: string[];
  isVerified?: boolean;
  city: string;
  qualityScore?: number;
  orderId?: string;
  onClick?: () => void;
  className?: string;
}

const badgeConfig: Record<string, { label: string; labelAr: string; icon: React.ReactNode; variant: 'primary' | 'gold' | 'accent' }> = {
  DISTINGUISHED: {
    label: 'Distinguished',
    labelAr: 'متميز',
    icon: <Award size={12} />,
    variant: 'gold',
  },
  TOP_RATED: {
    label: 'Top Rated',
    labelAr: 'الأعلى تقييماً',
    icon: <Star size={12} />,
    variant: 'primary',
  },
  FASTEST: {
    label: 'Fastest',
    labelAr: 'الأسرع',
    icon: <Zap size={12} />,
    variant: 'accent',
  },
  TRUSTED: {
    label: 'Trusted',
    labelAr: 'موثوق',
    icon: <Shield size={12} />,
    variant: 'primary',
  },
};

export function ShopCard({
  id,
  name,
  nameAr,
  logo,
  coverImage,
  rating,
  reviewCount,
  distance,
  estimatedDeliveryTime,
  badges = [],
  isVerified = false,
  city,
  qualityScore,
  orderId,
  onClick,
  className,
}: ShopCardProps) {
  const { isRTL } = useAppStore();

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-[#D0D6D7]/20 dark:border-slate-700',
        'shadow-[0_1px_3px_rgba(0,55,62,0.06)] hover:shadow-[0_4px_16px_rgba(0,55,62,0.1)]',
        'hover:-translate-y-0.5 transition-all duration-300 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Cover */}
      <div className="relative h-32 bg-[#F2E8D4]/30">
        <img
          src={coverImage}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00373E]/60 to-transparent" />
        {isVerified && (
          <div className="absolute top-3 right-3">
            <Badge variant="primary" size="sm">
              {isRTL ? 'موثق' : 'Verified'}
            </Badge>
          </div>
        )}
        <div className="absolute -bottom-8 right-4">
          <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-[0_4px_16px_rgba(0,55,62,0.1)] overflow-hidden bg-white">
            <img
              src={logo}
              alt={isRTL ? nameAr : name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-[#00373E] dark:text-slate-100">{isRTL ? nameAr : name}</h3>
            <p className="text-xs text-[#735B4D]/60 dark:text-slate-400">{city}</p>
          </div>
          <div className="flex items-center gap-1">
            <RatingStars rating={rating} size="sm" />
            <span className="text-xs font-semibold text-[#00373E] dark:text-slate-200">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-[#735B4D]/40">({reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#735B4D]/60 dark:text-slate-400 mb-3">
          {distance !== undefined && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {distance.toFixed(1)} {isRTL ? 'كم' : 'km'}
            </span>
          )}
          {estimatedDeliveryTime && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {estimatedDeliveryTime} {isRTL ? 'دقيقة' : 'min'}
            </span>
          )}
        </div>

        {qualityScore !== undefined && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black',
              qualityScore >= 90 ? 'bg-[#00373E]/10 text-[#00373E]'
              : qualityScore >= 75 ? 'bg-[#D4AF37]/10 text-[#B8960A]'
              : 'bg-[#735B4D]/10 text-[#735B4D]'
            )}>
              <Award size={11} />
              <span>{isRTL ? `جودة ${qualityScore}%` : `Quality ${qualityScore}%`}</span>
            </div>
          </div>
        )}

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {badges.map((badge) => {
              const config = badgeConfig[badge];
              if (!config) return null;
              return (
                <Badge key={badge} variant={config.variant} size="sm" dot>
                  <span className="flex items-center gap-1">
                    {config.icon}
                    {isRTL ? config.labelAr : config.label}
                  </span>
                </Badge>
              );
            })}
          </div>
        )}

        {orderId && (
          <a
            href={`/dashboard/customer/orders/${orderId}/rate`}
            className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#00373E] hover:text-[#002F35] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Star size={11} />
            {isRTL ? 'قيّم تجربتك' : 'Rate Your Experience'}
          </a>
        )}
      </div>
    </div>
  );
}
