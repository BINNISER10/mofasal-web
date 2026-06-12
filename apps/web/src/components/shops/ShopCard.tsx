'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { BRAND_COLORS } from '@mufasal/shared';
import { BrandPattern } from '@/components/shared/BrandPattern';
import { trackBehavior } from '@/lib/api/ai';

export interface ShopCardData {
  id: string;
  nameAr: string;
  nameEn: string;
  city: string;
  district: string;
  category: string;
  rating: number;
  reviewCount: number;
  orderCount: number;
  minPrice: number;
  deliveryDays: number;
  verified: boolean;
  specialties: string[];
  image: string | null;
  isOpen: boolean;
}

interface ShopCardProps {
  shop: ShopCardData;
  isRTL: boolean;
}

export function ShopCard({ shop, isRTL }: ShopCardProps) {
  const name = isRTL ? shop.nameAr : shop.nameEn;
  const initials = shop.nameAr.split(' ').slice(0, 2).map((w) => w[0]).join('');

  return (
    <Link
      href={`/shops/${shop.id}`}
      className="block group"
      onClick={() => trackBehavior('VIEW_SHOP', { shopId: shop.id })}
    >
      <Card className="overflow-hidden border border-cream-300/50 hover:shadow-mufasal-hover hover:-translate-y-1 transition-all duration-500 bg-white">
        {/* غلاف المتجر */}
        <div className="relative h-36 bg-gradient-to-br from-primary-800 via-primary-700 to-secondary-900 overflow-hidden">
          <BrandPattern tone="dark" opacity={0.2} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* شعار */}
          <div className="absolute bottom-0 start-4 translate-y-1/2 z-10">
            <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-mufasal overflow-hidden bg-white flex items-center justify-center">
              {shop.image ? (
                <Image src={shop.image} alt={name} width={64} height={64} className="object-cover w-full h-full" />
              ) : (
                <span className="text-xl font-black text-primary-700">{initials}</span>
              )}
            </div>
          </div>

          {/* شارات */}
          <div className="absolute top-3 end-3 flex flex-col gap-1.5 items-end">
            {shop.verified && (
              <span className="flex items-center gap-1 bg-white/95 backdrop-blur-sm text-primary-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                <CheckCircle2 size={11} className="text-primary-600" />
                {isRTL ? 'موثق' : 'Verified'}
              </span>
            )}
            <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${
              shop.isOpen ? 'bg-green-500/90 text-white' : 'bg-white/80 text-gray-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${shop.isOpen ? 'bg-white' : 'bg-gray-400'}`} />
              {shop.isOpen ? (isRTL ? 'مفتوح' : 'Open') : (isRTL ? 'مغلق' : 'Closed')}
            </span>
          </div>

          {/* خط ذهبي */}
          <div className="absolute bottom-0 inset-x-0 h-px">
            <div className="h-full w-12 bg-gold-400 group-hover:w-full transition-all duration-700 ease-out" />
          </div>
        </div>

        <div className="p-4 pt-10">
          <h3 className="font-bold text-primary-900 text-base leading-snug mb-1 group-hover:text-primary-700 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-accent-600 text-xs mb-3">
            <MapPin size={11} className="shrink-0" />
            <span>{shop.city}{shop.district ? ` · ${shop.district}` : ''}</span>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-gold-400 text-gold-400" />
              <span className="text-sm font-bold text-primary-800">{shop.rating || '—'}</span>
              <span className="text-xs text-accent-500">({shop.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-accent-500">
              <ShoppingBag size={11} />
              <span>{shop.orderCount.toLocaleString()}</span>
            </div>
          </div>

          {shop.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {shop.specialties.slice(0, 2).map((s) => (
                <span key={s} className="text-[10px] bg-cream-100 text-accent-700 px-2 py-0.5 rounded-full font-medium border border-cream-300/60">
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-cream-200/80">
            <div>
              <p className="text-[10px] text-accent-500 uppercase tracking-wide">{isRTL ? 'يبدأ من' : 'From'}</p>
              <p className="text-base font-black" style={{ color: BRAND_COLORS.gold }}>
                ﷼{shop.minPrice || '—'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-accent-500">
              <Clock size={11} />
              <span>{shop.deliveryDays} {isRTL ? 'أيام' : 'days'}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
