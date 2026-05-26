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
        'card-jahez-hover overflow-hidden group',
        className
      )}
      onClick={onClick}
    >
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={image}
          alt={isRTL ? nameAr : name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isLowStock && (
          <Badge variant="warning" className="absolute top-2 right-2">
            {isRTL ? 'مخزون محدود' : 'Low Stock'}
          </Badge>
        )}
        {isOutOfStock && (
          <Badge variant="error" className="absolute top-2 right-2">
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
            className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-16" />
        <div className="absolute bottom-2 right-3">
          <Badge variant="info" size="sm">
            {isRTL ? categoryAr : category}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
          {isRTL ? nameAr : name}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{merchantName}</p>
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-gold-500 text-gold-500" />
          <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({reviewCount})</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary-700">
            {price.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}
          </span>
          {oldPrice && (
            <span className="text-sm text-gray-400 line-through">
              {oldPrice.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}
            </span>
          )}
        </div>
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
