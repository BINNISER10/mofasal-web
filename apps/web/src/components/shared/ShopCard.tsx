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

const badgeConfig: Record<string, { label: string; labelAr: string; icon: React.ReactNode; variant: 'success' | 'gold' | 'info' }> = {
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
    variant: 'success',
  },
  FASTEST: {
    label: 'Fastest',
    labelAr: 'الأسرع',
    icon: <Zap size={12} />,
    variant: 'info',
  },
  TRUSTED: {
    label: 'Trusted',
    labelAr: 'موثوق',
    icon: <Shield size={12} />,
    variant: 'success',
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
      className={cn('card-jahez-hover overflow-hidden', className)}
      onClick={onClick}
    >
      <div className="relative h-32 bg-gray-200">
        <img
          src={coverImage}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {isVerified && (
          <div className="absolute top-3 right-3">
            <Badge variant="success" size="sm">
              {isRTL ? 'موثق' : 'Verified'}
            </Badge>
          </div>
        )}
        <div className="absolute -bottom-8 right-4">
          <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-jahez overflow-hidden bg-white">
            <img
              src={logo}
              alt={isRTL ? nameAr : name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <div className="pt-10 p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900">{isRTL ? nameAr : name}</h3>
            <p className="text-xs text-gray-500">{city}</p>
          </div>
          <div className="flex items-center gap-1">
            <RatingStars rating={rating} size="sm" />
            <span className="text-xs font-semibold text-gray-700">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
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
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black ${
              qualityScore >= 90 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : qualityScore >= 75 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
            }`}>
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
            className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
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
