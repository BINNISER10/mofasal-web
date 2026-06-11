'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/stores/appStore';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  id: string;
  name: string;
  nameAr: string;
  image: string;
  price: number;
  oldPrice?: number;
  category: string;
  categoryAr: string;
  rating: number;
  reviewCount: number;
  stock: number;
  merchantName: string;
  onAddToCart?: (id: string) => void;
  onClick?: () => void;
  className?: string;
}

export function ProductCard({
  id,
  name,
  nameAr,
  image,
  price,
  oldPrice,
  category,
  categoryAr,
  rating,
  reviewCount,
  stock,
  merchantName,
  onAddToCart,
  onClick,
  className,
}: ProductCardProps) {
  const { isRTL } = useAppStore();
  const [isLiked, setIsLiked] = React.useState(false);
  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock === 0;

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-[#D0D6D7]/20 dark:border-slate-700',
        'shadow-[0_1px_3px_rgba(0,55,62,0.06)] hover:shadow-[0_4px_16px_rgba(0,55,62,0.1)]',
        'hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-[#F2E8D4]/30 overflow-hidden">
        <img
          src={image}
          alt={isRTL ? nameAr : name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isLowStock && (
          <Badge variant="gold" className="absolute top-2 right-2">
            {isRTL ? 'مخزون محدود' : 'Low Stock'}
          </Badge>
        )}
        {isOutOfStock && (
          <Badge variant="danger" className="absolute top-2 right-2">
            {isRTL ? 'غير متوفر' : 'Out of Stock'}
          </Badge>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart
            size={16}
            className={isLiked ? 'fill-[#481719] text-[#481719]' : 'text-[#735B4D]/60'}
          />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#00373E]/50 to-transparent h-16" />
        <div className="absolute bottom-2 right-3">
          <Badge variant="primary" size="sm">
            {isRTL ? categoryAr : category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-[#00373E] dark:text-slate-100 mb-1 line-clamp-2">
          {isRTL ? nameAr : name}
        </h3>
        <p className="text-xs text-[#735B4D]/60 dark:text-slate-400 mb-2">{merchantName}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-[#D4AF37] text-[#D4AF37]" />
          <span className="text-xs font-semibold text-[#00373E] dark:text-slate-200">{rating.toFixed(1)}</span>
          <span className="text-xs text-[#735B4D]/40">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-[#00373E]">
            {price.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}
          </span>
          {oldPrice && (
            <span className="text-sm text-[#735B4D]/40 line-through">
              {oldPrice.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <Button
          variant={isOutOfStock ? 'ghost' : 'primary'}
          size="sm"
          fullWidth
          disabled={isOutOfStock}
          icon={<ShoppingCart size={16} />}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(id);
          }}
        >
          {isOutOfStock
            ? (isRTL ? 'غير متوفر' : 'Unavailable')
            : (isRTL ? 'أضف إلى السلة' : 'Add to Cart')}
        </Button>
      </div>
    </div>
  );
}
